import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DateRangeType } from './report-filter.dto';

export enum ProfitLossGroupByType {
  PRODUCT = 'product',
}

export class ProfitLossReportFilterDto {
  @ApiPropertyOptional({ description: 'Start date for custom range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Start date for custom range (alias for fromDate, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for custom range (alias for toDate, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ enum: DateRangeType, description: 'Predefined date range' })
  @IsOptional()
  @IsEnum(DateRangeType)
  dateRange?: DateRangeType;

  @ApiPropertyOptional({ enum: ProfitLossGroupByType, description: 'How to group the data' })
  @IsOptional()
  @IsEnum(ProfitLossGroupByType)
  groupBy?: ProfitLossGroupByType;

  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  branch_id?: number;
}
