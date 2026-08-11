import { PartialType } from '@nestjs/swagger';
import { CreateShippingStatusDto } from './create-shipping-status.dto';

export class UpdateShippingStatusDto extends PartialType(
  CreateShippingStatusDto,
) {}
