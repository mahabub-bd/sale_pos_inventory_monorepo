import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ShippingStatus } from '../entities/shipping-status.entity';

export class CreateShippingStatusDto {
  @ApiProperty({
    description: 'Sale ID to associate with shipping status',
    example: 101,
  })
  @IsNotEmpty()
  sale_id: number;

  @ApiProperty({
    description: 'Initial shipping status',
    enum: ShippingStatus,
    example: ShippingStatus.ORDERED,
    default: ShippingStatus.ORDERED,
  })
  @IsEnum(ShippingStatus)
  @IsOptional()
  status?: ShippingStatus;

  @ApiPropertyOptional({
    description: 'Tracking number for the shipment',
    example: 'TRK123456789',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  tracking_number?: string;

  @ApiPropertyOptional({
    description: 'Name of the shipping carrier',
    example: 'FedEx',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Delivery company name',
    example: 'FedEx',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  delivery_company?: string;

  @ApiPropertyOptional({
    description: 'Delivery person name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  delivery_person?: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2025-12-15',
  })
  @IsDateString()
  @IsOptional()
  estimated_delivery?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: '123 Main St, City, Country',
  })
  @IsString()
  @IsOptional()
  shipping_address?: string;

  @ApiPropertyOptional({
    description: 'Notes about shipping',
    example: 'Leave at door',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
