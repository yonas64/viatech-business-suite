import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { FinanceController } from './finance.controller';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
    AuthModule,
  ],
  controllers: [FinanceController, ExpensesController],
  providers: [FinanceService, ExpensesService],
  exports: [FinanceService],
})
export class FinanceModule {}
