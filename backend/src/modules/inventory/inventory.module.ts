import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ProductsModule } from '../products/product.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {
  InventoryMovement,
  InventoryMovementSchema,
} from './schemas/inventory-movement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    AuthModule,
    ProductsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
