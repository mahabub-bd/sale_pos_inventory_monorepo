import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SupplierShippingAddressDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Contact person name for shipping',
  })
  @IsOptional()
  @IsString()
  contact_name?: string;

  @ApiPropertyOptional({
    example: '01700000000',
    description: 'Contact phone number for shipping',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '456 Shipping Lane', description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Chattogram', description: 'City name' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Bangladesh', description: 'Country name' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: '2000',
    description: 'Postal or zip code',
  })
  @IsOptional()
  @IsString()
  postal_code?: string;
}
