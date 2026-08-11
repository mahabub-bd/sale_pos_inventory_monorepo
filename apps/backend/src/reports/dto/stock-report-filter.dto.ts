import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class StockReportFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brand_id?: number;
}
