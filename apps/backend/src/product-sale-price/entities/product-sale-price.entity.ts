import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_sale_prices')
@Index(['customer', 'product'], { unique: true })
export class ProductSalePrice {
  @ApiProperty({
    description: 'Unique ID of the product sale price',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'Customer who gets this special price',
    type: () => Customer,
  })
  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @Column({ name: 'customer_id' })
  customer_id: number;

  @ApiPropertyOptional({
    description: 'Product with special price for this customer',
    type: () => Product,
  })
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ApiProperty({
    description: 'Product ID',
    example: 5,
  })
  @Column({ name: 'product_id' })
  product_id: number;

  @ApiProperty({
    description: 'Custom sale price for this customer-product combination',
    example: 45.5,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  sale_price: number;

  @ApiProperty({
    description: 'Whether this custom price is currently active',
    example: true,
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Notes about this special pricing',
    example: 'Special sale price for VIP customer',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-29T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-29T15:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
