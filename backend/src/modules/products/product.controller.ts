import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProductDto, ProductVariantDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductsService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() query: ProductQueryDto,
    @Query() rawQuery: Record<string, string>,
  ) {
    return this.productsService.findAll(query, Object.keys(rawQuery).length > 0);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/variants')
  addVariant(@Param('id') id: string, @Body() variantDto: ProductVariantDto) {
    return this.productsService.addVariant(id, variantDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/variants/:variantId')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(id, variantId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/variants/:variantId')
  removeVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.removeVariant(id, variantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
