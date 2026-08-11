import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductSalePrice } from 'src/product-sale-price/entities/product-sale-price.entity';
import { SubCategory } from 'src/category/entities/subcategory.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,

    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,

    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(ProductSalePrice)
    private salePriceRepo: Repository<ProductSalePrice>,
  ) {}

  async create(dto: CreateProductDto, user: User) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(
        `Product with name "${dto.name}" already exists`,
      );
    }

    // Check duplicate SKU
    const existingSku = await this.repo.findOne({ where: { sku: dto.sku } });
    if (dto.sku && existingSku) {
      throw new ConflictException(
        `Product with SKU "${dto.sku}" already exists`,
      );
    }

    const product = new Product();

    product.name = dto.name;
    product.sku = dto.sku;
    product.barcode = dto.barcode;
    product.description = dto.description;
    product.selling_price = dto.selling_price;
    product.purchase_price = dto.purchase_price;
    product.discount_price = dto.discount_price;
    product.status = dto.status ?? true;
    product.product_type = dto.product_type;
    product.created_by = user;
    product.origin = dto.origin;
    product.expire_date = dto.expire_date;

    // Assign tags
    if (dto.tag_ids)
      product.tags = await this.tagRepo.findBy({ id: In(dto.tag_ids) });

    // Assign images
    if (dto.image_ids)
      product.images = dto.image_ids.map((id) => ({ id })) as any;

    // Assign Brand
    if (dto.brand_id) {
      product.brand = await this.brandRepo.findOne({
        where: { id: String(dto.brand_id) },
      });
      if (!product.brand) throw new NotFoundException('Brand not found');
    }

    // Assign Category
    if (dto.category_id) {
      product.category = await this.categoryRepo.findOne({
        where: { id: String(dto.category_id) },
      });
      if (!product.category) throw new NotFoundException('Category not found');
    }

    // Assign Subcategory + Validate relation
    if (dto.subcategory_id) {
      product.subcategory = await this.subCategoryRepo.findOne({
        where: { id: String(dto.subcategory_id) },
      });
      if (!product.subcategory)
        throw new NotFoundException('Subcategory not found');

      if (
        dto.category_id &&
        String(product.subcategory.category_id) !== String(dto.category_id)
      ) {
        throw new BadRequestException(
          `Subcategory does not belong to selected category`,
        );
      }
    }

    // Assign Supplier
    if (dto.supplier_id) {
      product.supplier = await this.supplierRepo.findOne({
        where: { id: dto.supplier_id },
      });
      if (!product.supplier) throw new NotFoundException('Supplier not found');
    }

    // Assign Unit
    if (dto.unit_id) {
      product.unit = await this.unitRepo.findOne({
        where: { id: dto.unit_id },
      });
      if (!product.unit) throw new NotFoundException('Unit not found');
    }

    // Save product first
    const savedProduct = await this.repo.save(product);

    // Handle customer-specific prices
    if (dto.customer_prices && dto.customer_prices.length > 0) {
      for (const customerPrice of dto.customer_prices) {
        if (!customerPrice.customer_id) {
          continue;
        }

        // Validate that sale_price is provided
        if (!customerPrice.sale_price) {
          throw new BadRequestException(
            `sale_price must be provided for customer ${customerPrice.customer_id}`,
          );
        }

        // Check if customer price already exists
        const existing = await this.salePriceRepo.findOne({
          where: {
            customer_id: customerPrice.customer_id,
            product_id: savedProduct.id,
          },
        });

        if (existing) {
          // Update existing
          existing.sale_price = customerPrice.sale_price;
          existing.is_active = customerPrice.is_active ?? true;
          await this.salePriceRepo.save(existing);
        } else {
          // Create new
          await this.salePriceRepo.save({
            customer_id: customerPrice.customer_id,
            product_id: savedProduct.id,
            sale_price: customerPrice.sale_price,
            is_active: customerPrice.is_active ?? true,
          });
        }
      }
    }

    return savedProduct;
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20,
    brandId?: number,
    supplierId?: number,
    categoryId?: number,
    subcategoryId?: number,
    origin?: string,
    hasExpiry?: boolean,
    productType?: string,
  ) {
    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .addSelect(['brand.id', 'brand.name'])
      .leftJoin('product.category', 'category')
      .addSelect(['category.id', 'category.name'])
      .leftJoin('product.subcategory', 'subcategory')
      .addSelect(['subcategory.id', 'subcategory.name'])
      .leftJoin('product.supplier', 'supplier')
      .addSelect(['supplier.id', 'supplier.name'])
      .leftJoin('product.unit', 'unit')
      .addSelect(['unit.id', 'unit.name'])
      // Load images - only id and url for list view
      .leftJoin('product.images', 'images')
      .addSelect(['images.id', 'images.url'])
      .orderBy('product.created_at', 'DESC');

    // Build where conditions
    const whereConditions: string[] = [];
    const parameters: Record<string, any> = {};

    // Search by name, SKU, or barcode
    if (search) {
      whereConditions.push(
        'LOWER(product.name) LIKE :search OR LOWER(product.sku) LIKE :search OR LOWER(product.barcode) LIKE :search',
      );
      parameters.search = `%${search.toLowerCase()}%`;
    }

    // Filter by brand
    if (brandId) {
      whereConditions.push('product.brand.id = :brandId');
      parameters.brandId = brandId;
    }

    // Filter by supplier
    if (supplierId) {
      whereConditions.push('product.supplier.id = :supplierId');
      parameters.supplierId = supplierId;
    }

    // Filter by category
    if (categoryId) {
      whereConditions.push('product.category.id = :categoryId');
      parameters.categoryId = categoryId;
    }

    // Filter by subcategory
    if (subcategoryId) {
      whereConditions.push('product.subcategory.id = :subcategoryId');
      parameters.subcategoryId = subcategoryId;
    }

    // Filter by origin
    if (origin) {
      whereConditions.push('LOWER(product.origin) LIKE :origin');
      parameters.origin = `%${origin.toLowerCase()}%`;
    }


    // Filter by products with expiry dates
    if (hasExpiry !== undefined) {
      if (hasExpiry) {
        whereConditions.push('product.expire_date IS NOT NULL');
      } else {
        whereConditions.push('product.expire_date IS NULL');
      }
    }

    // Filter by product type (supports comma-separated values)
    if (productType) {
      const productTypes = productType.split(',').map((t) => t.trim());
      whereConditions.push('product.product_type IN (:...productTypes)');
      parameters.productTypes = productTypes;
    }

    // Apply where conditions
    if (whereConditions.length > 0) {
      qb.where(whereConditions.join(' AND '), parameters);
    }

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Fetch aggregated stock data for all products in a single query
    const productIds = data.map(p => p.id);
    const stockData = productIds.length > 0 ? await this.repo.manager
      .createQueryBuilder(Inventory, 'inv')
      .select('inv.product_id', 'product_id')
      .addSelect('SUM(inv.quantity)', 'total_stock')
      .addSelect('SUM(inv.sold_quantity)', 'total_sold')
      .where('inv.product_id IN (:...productIds)', { productIds })
      .groupBy('inv.product_id')
      .getRawMany() : [];

    // Create a map for quick lookup
    const stockMap = new Map(
      stockData.map(row => [
        row.product_id,
        {
          total_stock: Number(row.total_stock) || 0,
          total_sold: Number(row.total_sold) || 0,
        }
      ])
    );

    // Fetch customer prices for all products in a single query
    const customerPricesData = productIds.length > 0 ? await this.salePriceRepo
      .createQueryBuilder('cp')
      .leftJoin('cp.customer', 'customer')
      .addSelect(['customer.id', 'customer.name', 'customer.customer_code'])
      .where('cp.product_id IN (:...productIds)', { productIds })
      .getMany() : [];

    // Group customer prices by product_id
    const customerPricesMap = new Map<number, any[]>();
    customerPricesData.forEach((cp: any) => {
      if (!customerPricesMap.has(cp.product_id)) {
        customerPricesMap.set(cp.product_id, []);
      }
      customerPricesMap.get(cp.product_id)!.push({
        id: cp.id,
        customer_id: cp.customer_id,
        customer_code: cp.customer?.customer_code,
        customer_name: cp.customer?.name,
        sale_price: cp.sale_price,
        is_active: cp.is_active,
      });
    });

    // Merge stock data and customer prices with products
    const productsWithStock = data.map((product: any) => {
      const stock = stockMap.get(product.id) || { total_stock: 0, total_sold: 0 };
      return {
        ...product,
        total_stock: stock.total_stock,
        total_sold: stock.total_sold,
        available_stock: stock.total_stock - stock.total_sold,
        customer_prices: customerPricesMap.get(product.id) || [],
      };
    });

    return {
      data: productsWithStock,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({
      where: { id },
      relations: [
        'brand',
        'category',
        'subcategory',
        'unit',
        'tags',
        'images',
        'supplier',
        'inventories',
        'inventories.warehouse',
      ],
    });

    if (!product) throw new NotFoundException('Product not found');

    // Load customer-specific prices for this product
    const customerPrices = await this.salePriceRepo.find({
      where: { product_id: id },
      relations: ['customer'],
    });

    // Calculate stock information
    const totalStock =
      product.inventories?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
    const totalSold =
      product.inventories?.reduce((sum, inv) => sum + inv.sold_quantity, 0) ||
      0;
    const availableStock = totalStock - totalSold;

    // Group stock by warehouse
    const stockByWarehouse =
      product.inventories?.map((inv) => ({
        warehouse: inv.warehouse,
        batch_no: inv.batch_no,
        quantity: inv.quantity,
        sold_quantity: inv.sold_quantity,
        available_quantity: inv.quantity - inv.sold_quantity,
        purchase_price: inv.purchase_price,
        expiry_date: inv.expiry_date,
      })) || [];

    return {
      ...product,
      total_stock: totalStock,
      total_sold: totalSold,
      available_stock: availableStock,
      stock_by_warehouse: stockByWarehouse,
      customer_prices: customerPrices.map((cp) => ({
        id: cp.id,
        customer_id: cp.customer_id,
        customer_code: cp.customer?.customer_code,
        customer_name: cp.customer?.name,
        sale_price: cp.sale_price,
        is_active: cp.is_active,
      })),
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.repo.findOne({
      where: { id },
      relations: [
        'brand',
        'category',
        'subcategory',
        'unit',
        'tags',
        'images',
        'supplier',
        'inventories',
        'inventories.warehouse',
      ],
    });

    // Update basic fields
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.barcode !== undefined) product.barcode = dto.barcode;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.selling_price !== undefined)
      product.selling_price = dto.selling_price;
    if (dto.purchase_price !== undefined)
      product.purchase_price = dto.purchase_price;
    if (dto.discount_price !== undefined)
      product.discount_price = dto.discount_price;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.product_type !== undefined) product.product_type = dto.product_type;
    if (dto.origin !== undefined) product.origin = dto.origin;
    if (dto.expire_date !== undefined) product.expire_date = dto.expire_date;

    if (dto.tag_ids)
      product.tags = await this.tagRepo.findBy({ id: In(dto.tag_ids) });

    // Assign images
    if (dto.image_ids)
      product.images = dto.image_ids.map((id) => ({ id })) as any;

    // Assign Brand
    if (dto.brand_id !== undefined) {
      if (dto.brand_id === null || dto.brand_id === 0) {
        product.brand = null;
      } else {
        product.brand = await this.brandRepo.findOne({
          where: { id: String(dto.brand_id) },
        });
        if (!product.brand) throw new NotFoundException('Brand not found');
      }
    }

    // Assign Category
    if (dto.category_id !== undefined) {
      if (dto.category_id === null || dto.category_id === 0) {
        product.category = null;
      } else {
        product.category = await this.categoryRepo.findOne({
          where: { id: String(dto.category_id) },
        });
        if (!product.category)
          throw new NotFoundException('Category not found');
      }
    }

    // Assign Subcategory + Validate relation
    if (dto.subcategory_id !== undefined) {
      if (dto.subcategory_id === null || dto.subcategory_id === 0) {
        product.subcategory = null;
      } else {
        product.subcategory = await this.subCategoryRepo.findOne({
          where: { id: String(dto.subcategory_id) },
        });
        if (!product.subcategory)
          throw new NotFoundException('Subcategory not found');

        if (
          dto.category_id &&
          String(product.subcategory.category_id) !== String(dto.category_id)
        ) {
          throw new BadRequestException(
            `Subcategory does not belong to selected category`,
          );
        }
      }
    }

    // Assign Supplier
    if (dto.supplier_id !== undefined) {
      if (dto.supplier_id === null || dto.supplier_id === 0) {
        product.supplier = null;
      } else {
        product.supplier = await this.supplierRepo.findOne({
          where: { id: dto.supplier_id },
        });
        if (!product.supplier)
          throw new NotFoundException('Supplier not found');
      }
    }

    // Assign Unit
    if (dto.unit_id !== undefined) {
      if (dto.unit_id === null || dto.unit_id === 0) {
        product.unit = null;
      } else {
        product.unit = await this.unitRepo.findOne({
          where: { id: dto.unit_id },
        });
        if (!product.unit) throw new NotFoundException('Unit not found');
      }
    }

    // Save product
    const savedProduct = await this.repo.save(product);

    // Handle customer-specific prices
    if (dto.customer_prices !== undefined) {
      // Delete all existing customer prices for this product
      await this.salePriceRepo.delete({
        product_id: savedProduct.id,
      });

      // Create new customer prices
      if (dto.customer_prices.length > 0) {
        for (const customerPrice of dto.customer_prices) {
          if (!customerPrice.customer_id) {
            continue;
          }

          // Validate that sale_price is provided
          if (!customerPrice.sale_price) {
            throw new BadRequestException(
              `sale_price must be provided for customer ${customerPrice.customer_id}`,
            );
          }

          await this.salePriceRepo.save({
            customer_id: customerPrice.customer_id,
            product_id: savedProduct.id,
            sale_price: customerPrice.sale_price,
            is_active: customerPrice.is_active ?? true,
          });
        }
      }
    }

    return savedProduct;
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.repo.remove(product);
  }

  // Specialized methods for brand and supplier queries
  async findByBrand(brandId: number, page: number = 1, limit: number = 20) {
    return this.findAll(undefined, page, limit, brandId, undefined, undefined, undefined);
  }

  async findBySupplier(
    supplierId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.findAll(undefined, page, limit, undefined, supplierId, undefined, undefined);
  }

  async findByOrigin(origin: string, page: number = 1, limit: number = 20) {
    return this.findAll(undefined, page, limit, undefined, undefined, undefined, undefined, origin, undefined, undefined);
  }


  async findProductsWithExpiry(page: number = 1, limit: number = 20) {
    return this.findAll(
      undefined,
      page,
      limit,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      undefined,
    );
  }

  async findProductsWithoutExpiry(page: number = 1, limit: number = 20) {
    return this.findAll(
      undefined,
      page,
      limit,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
    );
  }

}
