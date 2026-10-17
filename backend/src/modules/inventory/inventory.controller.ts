import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdjustStockDto, StockMovementDto } from './dto/create-stock-movement.dto';
import { MovementQueryDto, StockQueryDto } from './dto/stock-query.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('stock/add')
  addStock(@Body() dto: StockMovementDto, @Request() req: any) {
    return this.inventoryService.addStock(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('stock/remove')
  removeStock(@Body() dto: StockMovementDto, @Request() req: any) {
    return this.inventoryService.removeStock(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('stock/adjust')
  adjustStock(@Body() dto: AdjustStockDto, @Request() req: any) {
    return this.inventoryService.adjustStock(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stock')
  getCurrentStock(
    @Query() query: StockQueryDto,
  ) {
    return this.inventoryService.getCurrentStock(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('movements')
  findMovements(@Query() query: MovementQueryDto) {
    return this.inventoryService.findMovements(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('low-stock')
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }
}
