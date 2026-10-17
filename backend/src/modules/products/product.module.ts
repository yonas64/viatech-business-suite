import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/category.module';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import {
  InventoryMovement,
  InventoryMovementSchema,
} from '../inventory/schemas/inventory-movement.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { ProductController } from './product.controller';
import { ProductsService } from './product.service';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MongooseModule.forFeature([
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
    AuthModule,
    CategoriesModule,
  ],
  controllers: [ProductController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
