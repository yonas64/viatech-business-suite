import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async getSummary(from?: string, to?: string) {
    if (Boolean(from) !== Boolean(to)) {
      throw new BadRequestException('Provide both from and to dates');
    }
    const saleFilter: Record<string, unknown> = {};
    const expenseFilter: Record<string, unknown> = {};
    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        throw new BadRequestException('Invalid finance summary date range');
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) end.setUTCHours(23, 59, 59, 999);
      saleFilter.$or = [
        { saleDate: { $gte: start, $lte: end } },
        {
          saleDate: { $exists: false },
          createdAt: { $gte: start, $lte: end },
        },
      ];
      expenseFilter.expenseDate = { $gte: start, $lte: end };
    }
    const [inventoryProducts, sales] = await Promise.all([
      this.productModel.find({ active: true }).exec(),
      this.saleModel.find(saleFilter).exec(),
    ]);

    const currentInventoryCost = inventoryProducts.reduce((total, product) => {
      const variantCost = product.variants.reduce(
        (variantTotal, variant) => variantTotal + variant.quantity * variant.costPrice,
        0,
      );
      return total + variantCost;
    }, 0);

    const expectedProfit = inventoryProducts.reduce((total, product) => {
      const variantProfit = product.variants.reduce(
        (variantTotal, variant) => variantTotal + (variant.sellingPrice - variant.costPrice) * variant.quantity,
        0,
      );
      return total + variantProfit;
    }, 0);

    const salesSubtotal = this.round(sales.reduce((sum, sale) => sum + sale.subtotal, 0));
    const totalVat = this.round(sales.reduce((sum, sale) => sum + sale.vat, 0));
    const totalSales = this.round(sales.reduce((sum, sale) => sum + sale.total, 0));
    const totalCollected = this.round(
      sales.filter((sale) => sale.paymentStatus !== 'pending')
        .reduce((sum, sale) => sum + sale.total, 0),
    );
    const totalDue = this.round(
      sales.filter((sale) => sale.paymentStatus === 'pending')
        .reduce((sum, sale) => sum + sale.total, 0),
    );
    const costOfGoodsSold = this.round(
      sales.reduce(
        (sum, sale) =>
          sum + sale.items.reduce((lineSum, item) => lineSum + (item.costPrice ?? 0) * item.quantity, 0),
        0,
      ),
    );
    const [expenseSummary] = await this.expenseModel.aggregate([
      { $match: expenseFilter },
      { $group: { _id: null, expenses: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const expenses = this.round(expenseSummary?.expenses ?? 0);
    const grossProfit = this.round(salesSubtotal - costOfGoodsSold);
    const estimatedProfit = this.round(grossProfit - expenses);

    return {
      currentInventoryCost,
      expectedProfit,
      totalSales,
      salesSubtotal,
      totalVat,
      totalCollected,
      totalDue,
      costOfGoodsSold,
      expenses,
      expenseCount: expenseSummary?.count ?? 0,
      grossProfit,
      estimatedProfit,
      totalProfit: estimatedProfit,
      transactionCount: sales.length,
      productsTracked: inventoryProducts.length,
      filters: { from, to },
    };
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
