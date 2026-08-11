import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleListDto } from './dto/sale-list.dto';
import { CreateShippingStatusDto } from './dto/create-shipping-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';
import { Sale } from './entities/sale.entity'; // If you have entity model
import { SaleShippingStatus } from './entities/shipping-status.entity';
import { SaleShippingStatusHistory } from './entities/shipping-status-history.entity';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@ApiBearerAuth('token')
@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Permissions('sale.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiOkResponse({ description: 'Sale created successfully', type: Sale })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateSaleDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.salesService.create(dto, userId);
  }

  @Get('list')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get Sale List' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'saleType',
    required: false,
    enum: ['pos', 'regular'],
    description: 'Filter by sale type: pos or regular',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['held', 'completed', 'refunded', 'partial_refund', 'draft'],
    description: 'Filter by sale status',
    example: 'completed',
  })
  @ApiQuery({
    name: 'shipping_status',
    required: false,
    enum: ['ordered', 'packed', 'shipped', 'in_transit', 'delivered', 'cancelled', 'returned'],
    description: 'Filter by shipping status (only for regular sales)',
    example: 'shipped',
  })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by branch ID',
    example: 1,
  })
  @ApiQuery({
    name: 'customer_id',
    required: false,
    type: Number,
    description: 'Filter by customer ID',
    example: 1,
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of sales',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  async getAll(@Query() filters: SaleListDto) {
    return this.salesService.findAll(filters);
  }
  @Get('analytics/last-30-days')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get sales data for the last 30 days' })
  @ApiResponse({
    status: 200,
    description: 'Last 30 days sales data',
    schema: {
      example: {
        totalSales: 150000,
        totalOrders: 45,
        averageOrderValue: 3333.33,
        dailySales: [
          { date: '2025-12-03', total: 5000, orders: 3 },
          { date: '2025-12-02', total: 4500, orders: 2 },
        ],
      },
    },
  })
  async getLast30DaysSales() {
    return this.salesService.getLast30DaysSales();
  }

  @Get('analytics/month-wise')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get month-wise sales data' })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for month-wise data (defaults to current year)',
  })
  @ApiResponse({
    status: 200,
    description: 'Month-wise sales data',
    schema: {
      example: {
        year: 2025,
        monthlySales: [
          { month: 'Jan', total: 120000, orders: 35 },
          { month: 'Feb', total: 135000, orders: 42 },
          { month: 'Mar', total: 98000, orders: 28 },
        ],
        totalYearlySales: 1500000,
        totalYearlyOrders: 450,
      },
    },
  })
  async getMonthWiseSales(@Query('year', ParseIntPipe) year?: number) {
    return this.salesService.getMonthWiseSales(year);
  }

  @Get(':id')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get sale details by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 1 })
  @ApiOkResponse({
    description: 'Sale details retrieved successfully',
    type: Sale,
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOneWithRelations(id);
  }

  // Shipping Status Endpoints (only for regular sales)

  @Post(':id/shipping-status')
  @Permissions('sale.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create shipping status for a regular sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 101 })
  @ApiOkResponse({
    description: 'Shipping status created successfully',
    type: SaleShippingStatus,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 400,
    description: 'Shipping status already exists for this sale',
  })
  @ApiResponse({
    status: 400,
    description: 'Shipping is only available for regular sales, not POS sales',
  })
  async createShippingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateShippingStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.salesService.createShippingStatus(id, dto, userId);
  }

  @Get(':id/shipping-status')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get shipping status for a sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 101 })
  @ApiOkResponse({
    description: 'Shipping status retrieved successfully',
    type: SaleShippingStatus,
  })
  @ApiResponse({ status: 404, description: 'Shipping status not found' })
  async getShippingStatus(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getShippingStatusBySaleId(id);
  }

  @Put(':id/shipping-status')
  @Permissions('sale.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update shipping status for a sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 101 })
  @ApiOkResponse({
    description: 'Shipping status updated successfully',
    type: SaleShippingStatus,
  })
  @ApiResponse({ status: 404, description: 'Shipping status not found' })
  async updateShippingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.salesService.updateShippingStatus(id, dto, userId);
  }

  @Delete(':id/shipping-status')
  @Permissions('sale.delete')
  @ApiOperation({ summary: 'Delete shipping status for a sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 101 })
  @ApiResponse({
    status: 200,
    description: 'Shipping status deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipping status not found' })
  async deleteShippingStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    await this.salesService.deleteShippingStatus(id, userId);
    return { message: 'Shipping status deleted successfully' };
  }

  @Get(':id/shipping-status/history')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get shipping status history for a sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 101 })
  @ApiOkResponse({
    description: 'Shipping status history retrieved successfully',
    type: [SaleShippingStatusHistory],
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async getShippingStatusHistory(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getShippingStatusHistory(id);
  }
}
