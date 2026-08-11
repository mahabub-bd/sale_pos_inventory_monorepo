import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { ProductSalePrice } from './entities/product-sale-price.entity';
import { ProductSalePriceService } from './services/product-sale-price.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSalePrice, Role, Permission])],
  providers: [ProductSalePriceService, RbacService],
  exports: [ProductSalePriceService],
})
export class ProductSalePriceModule {}
