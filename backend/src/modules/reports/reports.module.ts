import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Expense, ExpenseSchema } from '../finance/schemas/expense.schema';
import {
  InventoryMovement,
  InventoryMovementSchema,
} from '../inventory/schemas/inventory-movement.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
