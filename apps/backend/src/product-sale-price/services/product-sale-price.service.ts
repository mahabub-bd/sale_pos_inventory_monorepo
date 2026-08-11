import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSalePrice } from '../entities/product-sale-price.entity';

/**
 * Service for managing product sale pricing.
 * This service is used internally by Product and Sales modules.
 * All sale pricing operations should be done through the Product module endpoints.
 */
@Injectable()
export class ProductSalePriceService {
  constructor(
    @InjectRepository(ProductSalePrice)
    private productSalePriceRepo: Repository<ProductSalePrice>,
  ) {}

  /**
   * Find customer-specific sale price by customer and product IDs
   * Used by Sales service to get pricing during sale creation
   */
  async findByCustomerAndProduct(
    customerId: number,
    productId: number,
  ): Promise<ProductSalePrice | null> {
    return await this.productSalePriceRepo.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
        is_active: true,
      },
    });
  }

  /**
   * Get the effective sale price for a customer and product
   * Used by Sales service during sale calculation
   * Returns customer-specific sale price if exists and active, otherwise returns null
   */
  async getEffectivePrice(customerId: number, productId: number) {
    const salePrice = await this.findByCustomerAndProduct(
      customerId,
      productId,
    );

    if (!salePrice) {
      return null;
    }

    // Return the fixed sale price
    return {
      type: 'fixed',
      value: salePrice.sale_price,
    };
  }
}
