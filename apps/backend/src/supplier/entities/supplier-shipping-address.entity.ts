import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('supplier_shipping_addresses')
export class SupplierShippingAddress {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Contact person name for shipping',
  })
  @Column({ nullable: true })
  contact_name?: string;

  @ApiPropertyOptional({
    example: '01700000000',
    description: 'Contact phone number for shipping',
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ example: '456 Shipping Lane', description: 'Street address' })
  @Column()
  street: string;

  @ApiProperty({ example: 'Chattogram', description: 'City name' })
  @Column()
  city: string;

  @ApiProperty({ example: 'Bangladesh', description: 'Country name' })
  @Column()
  country: string;

  @ApiPropertyOptional({
    example: '2000',
    description: 'Postal or zip code',
  })
  @Column({ nullable: true })
  postal_code?: string;

  @ApiPropertyOptional({
    description: 'Supplier this shipping address belongs to',
    type: () => Supplier,
  })
  @Exclude()
  @OneToOne(() => Supplier, (supplier) => supplier.shipping_address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'supplier_id', unique: true })
  supplier_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
