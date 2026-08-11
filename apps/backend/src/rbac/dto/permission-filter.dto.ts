import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class PermissionFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by permission key or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
