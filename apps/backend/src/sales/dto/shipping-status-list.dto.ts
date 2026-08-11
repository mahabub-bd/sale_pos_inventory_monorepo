import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { ShippingStatus } from '../entities/shipping-status.entity';
import { Type } from 'class-transformer';

export class ShippingStatusListDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by sale ID',
    example: 101,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sale_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by shipping status',
    enum: ShippingStatus,
    example: ShippingStatus.SHIPPED,
  })
  @IsOptional()
  @IsEnum(ShippingStatus)
  status?: ShippingStatus;

  @ApiPropertyOptional({
    description: 'Filter by branch ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
