import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { AuditService } from 'src/audit/audit.service';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import {
  StockMovement,
  StockMovementType,
} from 'src/inventory/entities/stock-movement.entity';
import { Product } from 'src/product/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleListDto } from './dto/sale-list.dto';
import { DiscountType } from './dto/sale-item.dto';
import { CreateShippingStatusDto } from './dto/create-shipping-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { Sale } from './entities/sale.entity';
import {
  SaleShippingStatus,
  ShippingStatus,
} from './entities/shipping-status.entity';
import { SaleShippingStatusHistory } from './entities/shipping-status-history.entity';
import { ProductSalePriceService } from 'src/product-sale-price/services/product-sale-price.service';

@Injectable()
export class SalesService {
  // account codes used in journal entries
  private SALES_ACCOUNT = 'INCOME.SALES';
  private COGS_ACCOUNT = 'EXPENSE.COGS';
  private INVENTORY_ACCOUNT = 'ASSET.INVENTORY';
  private CASH_ACCOUNT = 'ASSET.CASH';
  private GENERIC_BANK_ACCOUNT = 'ASSET.BANK'; // fallback if account_code not provided
  private GENERIC_AR = 'ASSET.ACCOUNTS_RECEIVABLE';
  private SALES_DISCOUNT_ACCOUNT = 'EXPENSE.SALES_DISCOUNT';
  private OUTPUT_VAT_ACCOUNT = 'LIABILITY.OUTPUT_VAT';

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(SalePayment)
    private salePaymentRepo: Repository<SalePayment>,
    @InjectRepository(SaleShippingStatus)
    private shippingStatusRepo: Repository<SaleShippingStatus>,
    @InjectRepository(SaleShippingStatusHistory)
    private shippingStatusHistoryRepo: Repository<SaleShippingStatusHistory>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Inventory) private invRepo: Repository<Inventory>,
    @InjectRepository(StockMovement) private movRepo: Repository<StockMovement>,
    private accountService: AccountService,
    private auditService: AuditService,
    private productSalePriceService: ProductSalePriceService,
  ) {}

  async create(createDto: CreateSaleDto, userId: number) {
    return await this.dataSource.transaction(async (manager) => {
      // Validate customer if provided (load with group for discount calculation)
      let customer: Customer | undefined = undefined;
      if (createDto.customer_id) {
        customer = await manager.findOne(Customer, {
          where: { id: createDto.customer_id },
          relations: ['group'],
        });
        if (!customer) throw new NotFoundException('Customer not found');
      }

      // basic invoice number generation
      const invoice_no =
        createDto.invoice_no || (await this.generateInvoiceNo(manager));

      // validate each item and update inventory (Option A: increment sold_quantity)
      const saleItems: SaleItem[] = [];
      let totalCost = 0; // for COGS
      let calculatedSubtotal = 0;
      let calculatedDiscount = 0;
      let calculatedTax = 0;
      for (const it of createDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: it.product_id },
        });
        if (!product)
          throw new NotFoundException(`Product ${it.product_id} not found`);

        // Find inventory rows for that product & warehouse (prefer earliest created)
        const inv = await manager.findOne(Inventory, {
          where: { product_id: it.product_id, warehouse_id: it.warehouse_id },
          order: { created_at: 'ASC' },
        });
        if (!inv)
          throw new BadRequestException(
            `No stock for product ${product.name} in warehouse ${it.warehouse_id}`,
          );

        // available based on your model => quantity - sold_quantity
        const available = Number(inv.quantity) - Number(inv.sold_quantity || 0);
        if (available < it.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${available}`,
          );
        }

        // increment sold_quantity (Option A)
        inv.sold_quantity =
          Number(inv.sold_quantity || 0) + Number(it.quantity);
        await manager.save(inv);

        // record a stock movement (TRANSFER/OUT equivalent)
        await manager.save(StockMovement, {
          product_id: it.product_id,
          warehouse_id: it.warehouse_id,
          quantity: it.quantity,
          type: StockMovementType.OUT, // OUT indicates sale
          note: `Sale ${invoice_no}`,
          reference_id: null,
          created_by: { id: userId } as any,
        });

        // compute COGS contribution (use product.purchase_price or fallback 0)
        const unitCost = Number(product.purchase_price ?? 0);
        totalCost += unitCost * Number(it.quantity);

        // Determine unit price with priority:
        // 1. Customer-specific product price (highest priority) - only if NO active group discount
        // 2. Default selling price (will have group discount applied later if applicable)
        let unitPrice = Number(product.selling_price ?? 0);

        // Only check customer-specific pricing if customer does NOT have an active group discount
        if (customer && !(customer?.group?.is_active && customer.group.discount_percentage > 0)) {
          try {
            const customPricing = await this.productSalePriceService.getEffectivePrice(
              customer.id,
              it.product_id,
            );

            if (customPricing) {
              // Use the sale price
              unitPrice = Number(customPricing.value);
            }
          } catch (error) {
            // If error fetching custom pricing, use default price
            console.warn('Error fetching custom pricing:', error.message);
          }
        }

        const lineSubtotal = unitPrice * Number(it.quantity);

        // Calculate item-level tax FIRST (always percentage, applied on full price)
        let itemTax = 0;
        if (it.tax_percentage && it.tax_percentage > 0) {
          itemTax = (lineSubtotal * Number(it.tax_percentage)) / 100;
        }

        // Calculate item-level discount AFTER tax (applied on subtotal + tax)
        let itemDiscount = 0;
        if (it.discount_value && it.discount_value > 0) {
          const amountWithTax = lineSubtotal + itemTax;
          if (it.discount_type === DiscountType.PERCENTAGE) {
            // Percentage discount: e.g., 10% = 10
            itemDiscount = (amountWithTax * Number(it.discount_value)) / 100;
          } else {
            // Fixed amount discount
            itemDiscount = Number(it.discount_value);
          }
        }

        const lineTotal = lineSubtotal + itemTax - itemDiscount;

        // Accumulate totals
        calculatedSubtotal += lineSubtotal;
        calculatedDiscount += itemDiscount;
        calculatedTax += itemTax;

        const saleItem = manager.create(SaleItem, {
          product,
          quantity: it.quantity,
          warehouse_id: it.warehouse_id,
          unit_price: unitPrice,
          discount: itemDiscount,
          tax: itemTax,
          line_total: lineTotal,
        });
        saleItems.push(saleItem);
      }

      // Apply sale-level tax FIRST (always percentage, applied on subtotal)
      let saleLevelTax = 0;
      if (createDto.tax_percentage && createDto.tax_percentage > 0) {
        saleLevelTax =
          (calculatedSubtotal * Number(createDto.tax_percentage)) / 100;
        calculatedTax += saleLevelTax;
      }

      // Apply sale-level discount (normal discount) - should apply to ALL customers
      let saleLevelDiscount = 0;
      if (createDto.discount_value && createDto.discount_value > 0) {
        const amountForNormalDiscount = calculatedSubtotal + calculatedTax;

        if (createDto.discount_type === DiscountType.PERCENTAGE) {
          // Percentage discount on subtotal + tax
          saleLevelDiscount =
            (amountForNormalDiscount * Number(createDto.discount_value)) / 100;
        } else {
          // Fixed amount discount
          saleLevelDiscount = Number(createDto.discount_value);
        }

        calculatedDiscount += saleLevelDiscount;
      }

      // Apply customer group discount (ADDITIONAL discount for group customers only)
      let groupDiscount = 0;
      if (
        customer?.group?.is_active &&
        customer.group.discount_percentage > 0
      ) {
        // Calculate group discount on the original amount (subtotal + tax)
        // Group discount is separate from normal discount
        const amountForGroupDiscount = calculatedSubtotal + calculatedTax;
        groupDiscount =
          (amountForGroupDiscount *
            Number(customer.group.discount_percentage)) /
          100;
        calculatedDiscount += groupDiscount;
      }

      // Calculate final total
      const calculatedTotal =
        calculatedSubtotal + calculatedTax - calculatedDiscount;

      // BUILD sale entity with calculated values
      const sale = manager.create(Sale, {
        invoice_no,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        manual_discount: saleLevelDiscount,
        group_discount: groupDiscount,
        tax: calculatedTax,
        total: calculatedTotal,
        paid_amount: createDto.paid_amount || 0,
        status:
          createDto.paid_amount && createDto.paid_amount >= calculatedTotal
            ? 'completed'
            : 'held',
        sale_type: createDto.sale_type || 'regular',
        customer: customer || null,
        created_by: { id: userId } as any,
        served_by: createDto.served_by_id
          ? ({ id: createDto.served_by_id } as any)
          : ({ id: userId } as any),
        branch_id: createDto.branch_id,
      });

      sale.items = saleItems;

      // persist sale + items
      const savedSale = await manager.save(Sale, sale);

      // REWARD POINTS: Every 50 TK spend earns 1 point (only for completed sales with customer)
      if (customer && savedSale.status === 'completed') {
        const pointsEarned = Math.floor(Number(savedSale.total) / 50);
        if (pointsEarned > 0) {
          customer.reward_points =
            Number(customer.reward_points || 0) + pointsEarned;
          await manager.save(Customer, customer);
        }
      }

      // ACCOUNTING

      // 1) Post Sales Revenue (credit) and Payment(s) (debits)
      // We'll create transaction lines: one credit for revenue (total), and debit lines for payments or AR.
      const journalLines = [];

      // Debit lines: payments provided
      let totalPaidFromPayments = 0;
      if (createDto.payments && createDto.payments.length) {
        for (const p of createDto.payments) {
          const accCode =
            p.account_code ||
            (p.method === 'cash'
              ? this.CASH_ACCOUNT
              : this.GENERIC_BANK_ACCOUNT);
          journalLines.push({
            account_code: accCode,
            debit: Number(p.amount),
            credit: 0,
            narration: `Payment Rececived for sale ${savedSale.id} (${p.method})`,
          });
          totalPaidFromPayments += Number(p.amount);
          // also persist sale_payment record
          const sp = manager.create(SalePayment, {
            sale: savedSale,
            method: p.method,
            amount: Number(p.amount),
            account_code: accCode,
            reference: p.reference || null,
          });
          await manager.save(sp);
        }
      } else if (createDto.paid_amount && createDto.paid_amount > 0) {
        // fallback single cash payment
        journalLines.push({
          account_code: this.CASH_ACCOUNT,
          debit: Number(createDto.paid_amount),
          credit: 0,
          narration: `Payment for sale ${savedSale.id} (cash)`,
        });
        totalPaidFromPayments += Number(createDto.paid_amount);
        const sp = manager.create(SalePayment, {
          sale: savedSale,
          method: 'cash',
          amount: Number(createDto.paid_amount),
          account_code: this.CASH_ACCOUNT,
        });
        await manager.save(sp);
      }

      // Always create AR entry for customer sales (even if fully paid)
      // This provides a complete audit trail in customer ledger
      if (customer && customer.account_id) {
        const arCode = `AR.CUSTOMER.${customer.id}`;
        const saleTotal = Number(savedSale.total);

        // Always create AR debit for the full sale amount
        journalLines.push({
          account_code: arCode,
          debit: saleTotal,
          credit: 0,
          narration: `Accounts receivable for sale ${savedSale.id}`,
        });

        // If payments were made during sale creation, immediately clear AR
        if (totalPaidFromPayments > 0) {
          journalLines.push({
            account_code: arCode,
            debit: 0,
            credit: totalPaidFromPayments,
            narration: `Payment received for sale ${savedSale.id}`,
          });
        }
      } else if (Number(savedSale.total) - Number(totalPaidFromPayments) > 0) {
        // Only create generic AR for non-customer sales or when no customer account exists
        const unpaid = Number(savedSale.total) - Number(totalPaidFromPayments);
        journalLines.push({
          account_code: this.GENERIC_AR,
          debit: unpaid,
          credit: 0,
          narration: `Accounts receivable for sale ${savedSale.id}`,
        });
      }

      // Credit: Sales revenue for gross amount (subtotal, before discount)
      journalLines.push({
        account_code: this.SALES_ACCOUNT,
        debit: 0,
        credit: Number(savedSale.subtotal),
        narration: `Sales revenue for ${savedSale.invoice_no}`,
      });

      // Debit: Sales discount (if any discount was applied)
      if (calculatedDiscount > 0) {
        journalLines.push({
          account_code: this.SALES_DISCOUNT_ACCOUNT,
          debit: calculatedDiscount,
          credit: 0,
          narration: `Sales discount for ${savedSale.invoice_no}`,
        });
      }

      // Credit: Output VAT/Tax (if any tax was collected)
      if (calculatedTax > 0) {
        journalLines.push({
          account_code: this.OUTPUT_VAT_ACCOUNT,
          debit: 0,
          credit: calculatedTax,
          narration: `Output VAT collected for ${savedSale.invoice_no}`,
        });
      }

      // 2) Post COGS / Inventory reduction
      // Debit COGS, Credit Inventory
      const cogsLines = [
        {
          account_code: this.COGS_ACCOUNT,
          debit: totalCost,
          credit: 0,
          narration: `COGS for sale ${savedSale.invoice_no}`,
        },
        {
          account_code: this.INVENTORY_ACCOUNT,
          debit: 0,
          credit: totalCost,
          narration: `Inventory reduction for sale ${savedSale.invoice_no}`,
        },
      ];

      // combine all lines and create transaction(s)
      // Create revenue/payment transaction
      await this.accountService.createTransaction(
        'sale',
        savedSale.id,
        journalLines,
      );

      // Create COGS transaction
      if (totalCost > 0) {
        await this.accountService.createTransaction(
          'sale_cogs',
          savedSale.id,
          cogsLines,
        );
      }

      const createdSale = await manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: ['items', 'payments', 'customer', 'customer.billing_address', 'customer.shipping_address', 'branch'],
      });

      // Auto-create shipping status for regular sales (not POS)
      if (createdSale.sale_type === 'regular') {
        const shippingStatus = manager.create(SaleShippingStatus, {
          sale_id: createdSale.id,
          status: ShippingStatus.ORDERED,
          shipping_address: createdSale.customer?.shipping_address
            ? `${createdSale.customer.shipping_address.street}, ${createdSale.customer.shipping_address.city}, ${createdSale.customer.shipping_address.country}`
            : null,
          created_by: { id: userId } as any,
          updated_by: { id: userId } as any,
        });

        await manager.save(SaleShippingStatus, shippingStatus);

        // Track initial status in history
        await this.trackStatusChange(
          manager,
          createdSale.id,
          null,
          ShippingStatus.ORDERED,
          userId,
          `Shipping status automatically created with status: ordered`,
          {
            invoice_no: createdSale.invoice_no,
            auto_created: true,
          },
        );
      }

      // Log sale creation
      await this.auditService.log(
        userId,
        null, // username will be captured by interceptor
        null, // IP will be captured by interceptor
        null,
        {
          action: 'CREATE' as any,
          module: 'SALES' as any,
          entityType: 'Sale',
          entityId: createdSale.id,
          entityIdentifier: createdSale.invoice_no,
          description: `Created sale ${createdSale.invoice_no} with total ${createdSale.total}`,
          newValues: {
            invoice_no: createdSale.invoice_no,
            customer_id: createdSale.customer?.id,
            total: createdSale.total,
            status: createdSale.status,
            items_count: createdSale.items.length,
          },
          metadata: {
            customer_name: createdSale.customer?.name,
            branch_id: createdSale.branch?.id,
          },
        },
      );

      return createdSale;
    });
  }

  async findOneWithRelations(id: number) {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'payments',
        'customer',
        'customer.billing_address',
        'customer.shipping_address',
        'created_by',
        'served_by',
        'branch',
        'shipping_status',
      ],
    });

    // Filter out payments with 0.00 amount
    if (sale && sale.payments) {
      sale.payments = sale.payments.filter((p) => Number(p.amount) > 0);
    }

    return sale;
  }

  async findAll(
    filters: SaleListDto,
  ): Promise<PaginationResponse<Sale>> {
    const {
      page = 1,
      limit = 10,
      saleType,
      status,
      branch_id,
      customer_id,
      fromDate,
      toDate
    } = filters;

    // Build query builder
    const queryBuilder = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('sale.payments', 'payments')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('customer.billing_address', 'billing_address')
      .leftJoinAndSelect('customer.shipping_address', 'shipping_address')
      .leftJoinAndSelect('sale.created_by', 'created_by')
      .leftJoinAndSelect('sale.served_by', 'served_by')
      .leftJoinAndSelect('sale.branch', 'branch')
      .orderBy('sale.created_at', 'DESC');

    // Apply filters
    if (saleType) {
      queryBuilder.andWhere('sale.sale_type = :saleType', { saleType });
    }

    if (status) {
      queryBuilder.andWhere('sale.status = :status', { status });
    }

    if (branch_id) {
      queryBuilder.andWhere('sale.branch_id = :branch_id', { branch_id });
    }

    if (customer_id) {
      queryBuilder.andWhere('sale.customerId = :customer_id', { customer_id });
    }

    if (fromDate) {
      queryBuilder.andWhere('sale.created_at >= :fromDate', {
        fromDate: new Date(fromDate)
      });
    }

    if (toDate) {
      queryBuilder.andWhere('sale.created_at <= :toDate', {
        toDate: new Date(toDate + ' 23:59:59') // Include the entire end date
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get data
    const data = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getLast30DaysSales() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get aggregated data for last 30 days
    const result = await this.saleRepo
      .createQueryBuilder('sale')
      .select('DATE(sale.created_at)', 'date')
      .addSelect('SUM(sale.total)', 'total')
      .addSelect('COUNT(sale.id)', 'orders')
      .where('sale.created_at >= :startDate', { startDate: thirtyDaysAgo })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .groupBy('DATE(sale.created_at)')
      .orderBy('date', 'DESC')
      .getRawMany();

    // Calculate summary statistics
    const totalSales = result.reduce(
      (sum, day) => sum + parseFloat(day.total || 0),
      0,
    );
    const totalOrders = result.reduce(
      (sum, day) => sum + parseInt(day.orders || 0),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      dailySales: result.map((day) => ({
        date: day.date,
        total: parseFloat(parseFloat(day.total || 0).toFixed(2)),
        orders: parseInt(day.orders || 0),
      })),
    };
  }

  async getMonthWiseSales(year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Get aggregated data for each month of the year
    const result = await this.saleRepo
      .createQueryBuilder('sale')
      .select('EXTRACT(MONTH FROM sale.created_at)', 'month')
      .addSelect('SUM(sale.total)', 'total')
      .addSelect('COUNT(sale.id)', 'orders')
      .where('EXTRACT(YEAR FROM sale.created_at) = :year', { year: targetYear })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .groupBy('EXTRACT(MONTH FROM sale.created_at)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Calculate summary statistics
    const totalYearlySales = result.reduce(
      (sum, month) => sum + parseFloat(month.total || 0),
      0,
    );
    const totalYearlyOrders = result.reduce(
      (sum, month) => sum + parseInt(month.orders || 0),
      0,
    );

    return {
      year: targetYear,
      monthlySales: result.map((month) => ({
        month: parseInt(month.month),
        monthName: monthNames[parseInt(month.month) - 1],
        total: parseFloat(parseFloat(month.total || 0).toFixed(2)),
        orders: parseInt(month.orders || 0),
      })),
      totalYearlySales: parseFloat(totalYearlySales.toFixed(2)),
      totalYearlyOrders,
    };
  }

  private async generateInvoiceNo(manager: any) {
    const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const base = `INV-${dateKey}`;
    // find last invoice that starts with base
    const last = await manager
      .createQueryBuilder(Sale, 's')
      .where('s.invoice_no LIKE :pattern', { pattern: `${base}%` })
      .orderBy('s.id', 'DESC')
      .getOne();

    if (!last) return `${base}-0001`;
    const seg = last.invoice_no.split('-').pop() || '0';
    const seq = parseInt(seg, 10) || 0;
    return `${base}-${String(seq + 1).padStart(4, '0')}`;
  }

  // Shipping Status Methods (only for regular sales)

  // Helper method to track status changes in history
  private async trackStatusChange(
    manager: any,
    saleId: number,
    previousStatus: ShippingStatus | null,
    newStatus: ShippingStatus,
    userId: number,
    notes?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const historyRecord = manager.create(SaleShippingStatusHistory, {
      sale_id: saleId,
      previous_status: previousStatus,
      new_status: newStatus,
      notes: notes,
      metadata: metadata,
      changed_by: { id: userId } as any,
    });

    await manager.save(SaleShippingStatusHistory, historyRecord);
  }

  async createShippingStatus(
    saleId: number,
    createDto: CreateShippingStatusDto,
    userId: number,
  ): Promise<SaleShippingStatus> {
    return await this.dataSource.transaction(async (manager) => {
      // Validate sale exists and is a regular sale
      const sale = await manager.findOne(Sale, {
        where: { id: saleId },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      if (sale.sale_type !== 'regular') {
        throw new BadRequestException(
          'Shipping status is only available for regular sales, not POS sales',
        );
      }

      // Check if shipping status already exists for this sale
      const existingStatus = await manager.findOne(SaleShippingStatus, {
        where: { sale_id: saleId },
      });

      if (existingStatus) {
        throw new BadRequestException(
          'Shipping status already exists for this sale. Use update to modify.',
        );
      }

      // Override sale_id with the param to ensure consistency
      createDto.sale_id = saleId;

      // Create shipping status with default status 'ordered'
      const shippingStatus = manager.create(SaleShippingStatus, {
        ...createDto,
        status: createDto.status || ShippingStatus.ORDERED,
        created_by: { id: userId } as any,
        updated_by: { id: userId } as any,
      });

      const savedShippingStatus = await manager.save(
        SaleShippingStatus,
        shippingStatus,
      );

      // Track initial status in history
      await this.trackStatusChange(
        manager,
        saleId,
        null, // No previous status for initial creation
        savedShippingStatus.status,
        userId,
        `Shipping status created with status: ${savedShippingStatus.status}`,
        {
          invoice_no: sale.invoice_no,
          tracking_number: savedShippingStatus.tracking_number,
          carrier: savedShippingStatus.carrier,
        },
      );

      // Log the creation
      await this.auditService.log(
        userId,
        null,
        null,
        null,
        {
          action: 'CREATE' as any,
          module: 'SALES' as any,
          entityType: 'SaleShippingStatus',
          entityId: savedShippingStatus.id,
          entityIdentifier: `Sale ${sale.invoice_no}`,
          description: `Created shipping status for sale ${sale.invoice_no}`,
          newValues: {
            sale_id: savedShippingStatus.sale_id,
            status: savedShippingStatus.status,
            tracking_number: savedShippingStatus.tracking_number,
            carrier: savedShippingStatus.carrier,
          },
          metadata: {
            invoice_no: sale.invoice_no,
          },
        },
      );

      return savedShippingStatus;
    });
  }

  async getShippingStatusBySaleId(saleId: number): Promise<SaleShippingStatus> {
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const shippingStatus = await this.shippingStatusRepo.findOne({
      where: { sale_id: saleId },
      relations: ['created_by', 'updated_by'],
    });

    if (!shippingStatus) {
      throw new NotFoundException(
        `No shipping status found for sale with ID ${saleId}`,
      );
    }

    return shippingStatus;
  }

  async updateShippingStatus(
    saleId: number,
    updateDto: UpdateShippingStatusDto,
    userId: number,
  ): Promise<SaleShippingStatus> {
    return await this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(Sale, {
        where: { id: saleId },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      const shippingStatus = await manager.findOne(SaleShippingStatus, {
        where: { sale_id: saleId },
      });

      if (!shippingStatus) {
        throw new NotFoundException('Shipping status not found');
      }

      // Store old values for audit
      const oldValues = {
        status: shippingStatus.status,
        tracking_number: shippingStatus.tracking_number,
        carrier: shippingStatus.carrier,
        delivery_company: shippingStatus.delivery_company,
        delivery_person: shippingStatus.delivery_person,
        estimated_delivery: shippingStatus.estimated_delivery,
        actual_delivery: shippingStatus.actual_delivery,
        notes: shippingStatus.notes,
      };

      // Track status change if status is being updated
      const previousStatus = shippingStatus.status;

      // Update fields
      if (updateDto.status !== undefined) {
        shippingStatus.status = updateDto.status;
      }

      if (updateDto.tracking_number !== undefined) {
        shippingStatus.tracking_number = updateDto.tracking_number;
      }

      if (updateDto.carrier !== undefined) {
        shippingStatus.carrier = updateDto.carrier;
      }

      if (updateDto.delivery_company !== undefined) {
        shippingStatus.delivery_company = updateDto.delivery_company;
      }

      if (updateDto.delivery_person !== undefined) {
        shippingStatus.delivery_person = updateDto.delivery_person;
      }

      if (updateDto.estimated_delivery !== undefined) {
        shippingStatus.estimated_delivery = new Date(
          updateDto.estimated_delivery,
        );
      }

      if (updateDto.shipping_address !== undefined) {
        shippingStatus.shipping_address = updateDto.shipping_address;
      }

      if (updateDto.notes !== undefined) {
        shippingStatus.notes = updateDto.notes;
      }

      // If status is delivered and actual_delivery is not set, set it to now
      if (
        updateDto.status === ShippingStatus.DELIVERED &&
        !shippingStatus.actual_delivery
      ) {
        shippingStatus.actual_delivery = new Date();
      }

      shippingStatus.updated_by = { id: userId } as any;

      const updatedShippingStatus = await manager.save(
        SaleShippingStatus,
        shippingStatus,
      );

      // Track status change in history if status was changed
      if (updateDto.status !== undefined && previousStatus !== updateDto.status) {
        await this.trackStatusChange(
          manager,
          saleId,
          previousStatus,
          updatedShippingStatus.status,
          userId,
          `Status changed from ${previousStatus} to ${updatedShippingStatus.status}`,
          {
            invoice_no: sale.invoice_no,
            tracking_number: updatedShippingStatus.tracking_number,
            carrier: updatedShippingStatus.carrier,
            delivery_company: updatedShippingStatus.delivery_company,
            delivery_person: updatedShippingStatus.delivery_person,
          },
        );
      }

      // Log the update
      await this.auditService.log(
        userId,
        null,
        null,
        null,
        {
          action: 'UPDATE' as any,
          module: 'SALES' as any,
          entityType: 'SaleShippingStatus',
          entityId: updatedShippingStatus.id,
          entityIdentifier: `Sale ${sale.invoice_no}`,
          description: `Updated shipping status for sale ${sale.invoice_no}`,
          oldValues,
          newValues: {
            status: updatedShippingStatus.status,
            tracking_number: updatedShippingStatus.tracking_number,
            carrier: updatedShippingStatus.carrier,
            delivery_company: updatedShippingStatus.delivery_company,
            delivery_person: updatedShippingStatus.delivery_person,
            estimated_delivery: updatedShippingStatus.estimated_delivery,
            actual_delivery: updatedShippingStatus.actual_delivery,
          },
          metadata: {
            invoice_no: sale.invoice_no,
            sale_id: sale.id,
          },
        },
      );

      return updatedShippingStatus;
    });
  }

  async deleteShippingStatus(saleId: number, userId: number): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(Sale, {
        where: { id: saleId },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      const shippingStatus = await manager.findOne(SaleShippingStatus, {
        where: { sale_id: saleId },
      });

      if (!shippingStatus) {
        throw new NotFoundException('Shipping status not found');
      }

      await manager.delete(SaleShippingStatus, shippingStatus.id);

      // Log the deletion
      await this.auditService.log(
        userId,
        null,
        null,
        null,
        {
          action: 'DELETE' as any,
          module: 'SALES' as any,
          entityType: 'SaleShippingStatus',
          entityId: shippingStatus.id,
          entityIdentifier: `Sale ${sale.invoice_no}`,
          description: `Deleted shipping status for sale ${sale.invoice_no}`,
          oldValues: {
            sale_id: shippingStatus.sale_id,
            status: shippingStatus.status,
            tracking_number: shippingStatus.tracking_number,
          },
          metadata: {
            invoice_no: sale.invoice_no,
          },
        },
      );
    });
  }

  async getShippingStatusHistory(saleId: number): Promise<SaleShippingStatusHistory[]> {
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const history = await this.shippingStatusHistoryRepo.find({
      where: { sale_id: saleId },
      relations: ['changed_by'],
      order: { created_at: 'DESC' },
    });

    return history;
  }
}
