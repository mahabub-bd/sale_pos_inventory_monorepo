import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DateRangeType } from './report-filter.dto';

export enum ExpenseGroupByType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CATEGORY = 'category',
  BRANCH = 'branch',
}

export class ExpenseReportFilterDto {
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

  @ApiPropertyOptional({ enum: ExpenseGroupByType, description: 'How to group the data' })
  @IsOptional()
  @IsEnum(ExpenseGroupByType)
  groupBy?: ExpenseGroupByType;

  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  branch_id?: number;

  @ApiPropertyOptional({ description: 'Filter by expense category ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expense_category_id?: number;

  @ApiPropertyOptional({ description: 'Include comparison with previous period' })
  @IsOptional()
  includeComparison?: boolean;
}
