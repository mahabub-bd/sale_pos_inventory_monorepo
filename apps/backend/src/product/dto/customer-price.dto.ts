import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CustomerPriceDto {
  @ApiPropertyOptional({ description: 'Customer ID', example: 1 })
  @IsNumber()
  @IsOptional()
  customer_id?: number;

  @ApiPropertyOptional({
    description: 'Sale price for this customer',
    example: 80,
  })
  @IsNumber()
  @IsOptional()
  sale_price?: number;

  @ApiPropertyOptional({
    description: 'Whether this price is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
