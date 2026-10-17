import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  formatVariantSpecification,
  Product,
  ProductDocument,
} from '../products/schemas/product.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Expense, ExpenseDocument } from '../finance/schemas/expense.schema';
import {
  InventoryMovement,
  InventoryMovementDocument,
} from '../inventory/schemas/inventory-movement.schema';
import { ReportQueryDto } from './dto/report-query.dto';

interface ReportFilters {
  productId?: string;
  categoryId?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovementDocument>,
  ) {}

  async getDailyReport(query: ReportQueryDto = {}) {
    const target = query.date ? this.parseDate(query.date) : new Date();
    const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()));
    return this.buildSalesSummary(start, this.addDays(start, 1), query);
  }

  async getWeeklyReport(query: ReportQueryDto = {}) {
    const target = query.date ? this.parseDate(query.date) : new Date();
    const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    return this.buildSalesSummary(start, this.addDays(start, 7), query);
  }

  async getMonthlyReport(query: ReportQueryDto = {}) {
    const target = query.date ? this.parseDate(query.date) : new Date();
    const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 1));
    const end = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 1));
    return this.buildSalesSummary(start, end, query);
  }

  async getSummary(query: ReportQueryDto) {
    if (!query.from || !query.to) {
      throw new BadRequestException('Both from and to dates are required');
    }
    const start = this.parseDate(query.from);
    const end = this.parseDate(query.to);
    if (start > end) {
      throw new BadRequestException('from must be earlier than or equal to to');
    }
    // Make a date-only upper bound inclusive for the whole UTC day.
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) end.setUTCHours(23, 59, 59, 999);
    return this.buildSalesSummary(start, end, query, true);
  }

  private async buildSalesSummary(
    start: Date,
    end: Date,
    filters: ReportFilters,
    inclusiveEnd = false,
  ) {
    const dateFilter = inclusiveEnd ? { $gte: start, $lte: end } : { $gte: start, $lt: end };
    const legacyProductIds = filters.categoryId
      ? await this.productModel.distinct('_id', {
          category: new Types.ObjectId(filters.categoryId),
        })
      : [];
    const categoryProductIdSet = new Set(legacyProductIds.map((id) => id.toString()));
    const saleFilter: Record<string, unknown> = {
      $or: [
        { saleDate: dateFilter },
        { saleDate: { $exists: false }, createdAt: dateFilter },
      ],
    };
    if (filters.productId || filters.categoryId) {
      const itemFilter: Record<string, unknown> = {};
      if (filters.productId) itemFilter.product = new Types.ObjectId(filters.productId);
      if (filters.categoryId) {
        itemFilter.$or = [
          { category: new Types.ObjectId(filters.categoryId) },
          {
            category: { $exists: false },
            product: { $in: legacyProductIds },
          },
        ];
      }
      saleFilter.items = { $elemMatch: itemFilter };
    }

    const sales = await this.saleModel.find(saleFilter).sort({ saleDate: -1 }).exec();
    const relevantItems = sales.flatMap((sale) =>
      sale.items
        .filter((item) => {
          if (filters.productId && item.product.toString() !== filters.productId) return false;
          if (
            filters.categoryId &&
            item.category?.toString() !== filters.categoryId &&
            !(!item.category && categoryProductIdSet.has(item.product.toString()))
          ) return false;
          return true;
        })
        .map((item) => ({ item, paymentStatus: sale.paymentStatus })),
    );

    const subtotal = this.round(relevantItems.reduce((sum, entry) => sum + entry.item.subtotal, 0));
    const vat = this.round(relevantItems.reduce((sum, entry) => sum + entry.item.vat, 0));
    const total = this.round(relevantItems.reduce((sum, entry) => sum + entry.item.total, 0));
    const totalCollected = this.round(
      relevantItems
        .filter((entry) => entry.paymentStatus !== 'pending')
        .reduce((sum, entry) => sum + entry.item.total, 0),
    );
    const totalDue = this.round(
      relevantItems
        .filter((entry) => entry.paymentStatus === 'pending')
        .reduce((sum, entry) => sum + entry.item.total, 0),
    );
    const costOfGoodsSold = this.round(
      relevantItems.reduce(
        (sum, entry) => sum + (entry.item.costPrice ?? 0) * entry.item.quantity,
        0,
      ),
    );

    const expenseFilter: Record<string, unknown> = { expenseDate: dateFilter };
    const [expenseTotals, products, movements] = await Promise.all([
      this.expenseModel.aggregate([
        { $match: expenseFilter },
        { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.productModel.find({ active: true }).populate('category').exec(),
      this.movementModel
        .find({ createdAt: dateFilter })
        .populate('product')
        .populate('createdBy', 'name username')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
    ]);

    const stockProducts = products.filter((product) => {
      if (filters.productId && product._id.toString() !== filters.productId) return false;
      if (filters.categoryId) {
        const categoryId =
          product.category instanceof Types.ObjectId
            ? product.category.toString()
            : (product.category as unknown as { _id: Types.ObjectId })?._id?.toString();
        if (categoryId !== filters.categoryId) return false;
      }
      return true;
    });
    const stockProductIds = new Set(stockProducts.map((product) => product._id.toString()));
    const lowStockProducts = stockProducts.flatMap((product) =>
      product.variants
        .filter((variant) => variant.quantity <= (variant.lowStockThreshold ?? 0))
        .map((variant) => ({
          productId: product._id,
          productName: product.name,
          variantId: variant._id?.toString() ?? 'unknown',
          sku: variant.sku,
          specification: formatVariantSpecification(variant),
          quantity: variant.quantity,
          lowStockThreshold: variant.lowStockThreshold ?? 0,
        })),
    );
    const currentStock = stockProducts.reduce(
      (sum, product) =>
        sum + product.variants.reduce((variantSum, variant) => variantSum + variant.quantity, 0),
      0,
    );

    const bestSelling = relevantItems.reduce<
      Record<string, { productId: string; productName: string; quantity: number }>
    >((acc, { item }) => {
      const key = item.product.toString();
      const current = acc[key] ?? {
        productId: key,
        productName: item.productName,
        quantity: 0,
      };
      current.quantity += item.quantity;
      acc[key] = current;
      return acc;
    }, {});

    const relevantSaleIds = new Set(sales.map((sale) => sale._id.toString()));
    const recentSales = sales
      .filter((sale) => relevantSaleIds.has(sale._id.toString()))
      .slice(0, 10)
      .map((sale) => ({
        id: sale._id,
        saleReference: sale.saleReference,
        saleDate: sale.saleDate ?? sale.createdAt,
        total: this.round(
          sale.items
            .filter((item) => {
              if (filters.productId && item.product.toString() !== filters.productId) return false;
              if (
                filters.categoryId &&
                item.category?.toString() !== filters.categoryId &&
                !(!item.category && categoryProductIdSet.has(item.product.toString()))
              ) return false;
              return true;
            })
            .reduce((sum, item) => sum + item.total, 0),
        ),
        paymentStatus: sale.paymentStatus,
      }));
    const expenses = this.round(expenseTotals[0]?.amount ?? 0);
    const grossProfit = this.round(subtotal - costOfGoodsSold);
    const estimatedProfit = this.round(grossProfit - expenses);
    const expenseCount = expenseTotals[0]?.count ?? 0;
    const recentStockMovements = movements.filter((movement) =>
      stockProductIds.has(movement.product._id?.toString?.() ?? movement.product.toString()),
    );
    const matchingSalesCount = this.countMatchingSales(sales, filters, categoryProductIdSet);

    return {
      period: { from: start, to: end },
      filters: { productId: filters.productId, categoryId: filters.categoryId },
      salesCount: matchingSalesCount,
      transactionCount: matchingSalesCount,
      productsSold: relevantItems.reduce((sum, entry) => sum + entry.item.quantity, 0),
      salesSubtotal: subtotal,
      subtotal,
      vat,
      total,
      totalCollected,
      totalDue,
      costOfGoodsSold,
      expenses,
      expenseCount,
      grossProfit,
      estimatedProfit,
      totalProfit: estimatedProfit,
      bestSellingProducts: Object.values(bestSelling).sort((a, b) => b.quantity - a.quantity),
      lowStockProducts,
      currentStock,
      recentSales,
      recentStockMovements,
    };
  }

  private countMatchingSales(
    sales: SaleDocument[],
    filters: ReportFilters,
    categoryProductIdSet: Set<string>,
  ) {
    return sales.filter((sale) =>
      sale.items.some((item) => {
        if (filters.productId && item.product.toString() !== filters.productId) return false;
        if (
          filters.categoryId &&
          item.category?.toString() !== filters.categoryId &&
          !(!item.category && categoryProductIdSet.has(item.product.toString()))
        ) return false;
        return true;
      }),
    ).length;
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      ) {
        throw new BadRequestException(`Invalid date: ${value}`);
      }
    }
    return date;
  }

  private addDays(date: Date, days: number) {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + days);
    return end;
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}