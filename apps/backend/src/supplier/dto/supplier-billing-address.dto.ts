import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SupplierBillingAddressDto {
  @ApiPropertyOptional({
    example: 'Jane Smith',
    description: 'Contact person name for billing',
  })
  @IsOptional()
  @IsString()
  contact_name?: string;

  @ApiPropertyOptional({
    example: '01700000000',
    description: 'Contact phone number for billing',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '789 Billing Road', description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Dhaka', description: 'City name' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Bangladesh', description: 'Country name' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: '1000',
    description: 'Postal or zip code',
  })
  @IsOptional()
  @IsString()
  postal_code?: string;
}
