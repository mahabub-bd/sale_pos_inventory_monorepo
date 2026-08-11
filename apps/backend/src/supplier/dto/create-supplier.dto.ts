import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SupplierBillingAddressDto } from './supplier-billing-address.dto';
import { SupplierShippingAddressDto } from './supplier-shipping-address.dto';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Techno Distributors Ltd.',
    description: 'Name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Mahabub Hossain',
    description: 'Primary contact person',
  })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiProperty({
    required: false,
    example: '+8801712345678',
    description: 'Supplier phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    example: 'supplier@example.com',
    description: 'Supplier email address',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    required: false,
    example: 'Net 30 days',
    description: 'Payment term or agreement',
  })
  @IsOptional()
  @IsString()
  payment_terms?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Billing address for the supplier',
    type: () => SupplierBillingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierBillingAddressDto)
  billing_address?: SupplierBillingAddressDto;

  @ApiPropertyOptional({
    required: false,
    description: 'Shipping address for the supplier',
    type: () => SupplierShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierShippingAddressDto)
  shipping_address?: SupplierShippingAddressDto;
}
