import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Post()
  createSale(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.salesService.createSale(createSaleDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
