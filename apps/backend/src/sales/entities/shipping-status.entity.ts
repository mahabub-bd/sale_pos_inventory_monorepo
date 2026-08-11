import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

export enum ShippingStatus {
  ORDERED = 'ordered',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('sale_shipping_status')
export class SaleShippingStatus {
  @ApiProperty({
    description: 'Unique ID of the shipping status',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Sale associated with this shipping status',
    type: () => Sale,
  })
  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @ApiProperty({
    description: 'Sale ID',
    example: 101,
  })
  @Column({ name: 'sale_id' })
  sale_id: number;

  @ApiProperty({
    description: 'Current shipping status',
    enum: ShippingStatus,
    example: ShippingStatus.ORDERED,
  })
  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.ORDERED,
  })
  status: ShippingStatus;

  @ApiPropertyOptional({
    description: 'Tracking number for the shipment',
    example: 'TRK123456789',
  })
  @Column({ name: 'tracking_number', nullable: true, type: 'varchar' })
  tracking_number?: string;

  @ApiPropertyOptional({
    description: 'Name of the shipping carrier',
    example: 'FedEx',
  })
  @Column({ name: 'carrier', nullable: true, type: 'varchar' })
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Delivery company name',
    example: 'FedEx',
  })
  @Column({ name: 'delivery_company', nullable: true, type: 'varchar' })
  delivery_company?: string;

  @ApiPropertyOptional({
    description: 'Delivery person name',
    example: 'John Doe',
  })
  @Column({ name: 'delivery_person', nullable: true, type: 'varchar' })
  delivery_person?: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2025-12-15',
  })
  @Column({ name: 'estimated_delivery', nullable: true, type: 'date' })
  estimated_delivery?: Date;

  @ApiPropertyOptional({
    description: 'Actual delivery date',
    example: '2025-12-14',
  })
  @Column({ name: 'actual_delivery', nullable: true, type: 'date' })
  actual_delivery?: Date;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: '123 Main St, City, Country',
  })
  @Column({ name: 'shipping_address', nullable: true, type: 'text' })
  shipping_address?: string;

  @ApiPropertyOptional({
    description: 'Notes about shipping',
    example: 'Leave at door',
  })
  @Column({ name: 'notes', nullable: true, type: 'text' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'User who created this shipping status',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by?: User;

  @ApiPropertyOptional({
    description: 'User who last updated this shipping status',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updated_by?: User;

  @ApiProperty({
    description: 'Shipping status creation timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({
    description: 'Shipping status last updated timestamp',
    example: '2025-12-01T15:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
