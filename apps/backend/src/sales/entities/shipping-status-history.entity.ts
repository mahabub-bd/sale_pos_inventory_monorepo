import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { ShippingStatus } from './shipping-status.entity';

@Entity('sale_shipping_status_history')
export class SaleShippingStatusHistory {
  @ApiProperty({
    description: 'Unique ID of the status history record',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Sale associated with this status change',
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
    description: 'Previous status before the change',
    enum: ShippingStatus,
    example: ShippingStatus.ORDERED,
  })
  @Column({
    type: 'enum',
    enum: ShippingStatus,
    nullable: true,
  })
  previous_status: ShippingStatus | null;

  @ApiProperty({
    description: 'New status after the change',
    enum: ShippingStatus,
    example: ShippingStatus.PACKED,
  })
  @Column({
    type: 'enum',
    enum: ShippingStatus,
  })
  new_status: ShippingStatus;

  @ApiPropertyOptional({
    description: 'Notes or comments about the status change',
    example: 'Order packed and ready for shipping',
  })
  @Column({ name: 'notes', nullable: true, type: 'text' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata in JSON format',
    example: '{"location": "Warehouse A", "processed_by": "John"}',
  })
  @Column({ name: 'metadata', nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'User who made this status change',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changed_by?: User;

  @ApiProperty({
    description: 'Status change timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
