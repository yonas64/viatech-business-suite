import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, SaleSchema } from './schemas/sale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
    AuthModule,
    InventoryModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
