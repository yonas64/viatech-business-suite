import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryService } from '../inventory/inventory.service';
import {
  formatVariantSpecification,
  Product,
  ProductDocument,
} from '../products/schemas/product.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale, SaleDocument } from './schemas/sale.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    private readonly inventoryService: InventoryService,
  ) {}

  async createSale(createSaleDto: CreateSaleDto, cashierId: string) {
    const processedItems: any[] = [];

    for (const item of createSaleDto.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const variant = product.variants.find(
        (variantItem: any) => variantItem._id?.toString() === item.variantId,
      ) as any;
      if (!variant) {
        throw new NotFoundException(`Variant ${item.variantId} not found`);
      }

      if (variant.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name} ${formatVariantSpecification(variant)}. Available: ${variant.quantity}`,
        );
      }

      const unitPrice = variant.sellingPrice;
      if (item.unitPrice !== undefined && item.unitPrice !== unitPrice) {
        throw new BadRequestException(
          `Price for ${variant.sku} has changed. Current selling price: ${unitPrice}`,
        );
      }
      const vatRate = variant.vatRate ?? 0.15;
      if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 1) {
        throw new BadRequestException(`Invalid VAT rate configured for ${variant.sku}`);
      }
      const subtotal = this.roundCurrency(item.quantity * unitPrice);
      const vat = this.roundCurrency(subtotal * vatRate);
      const total = this.roundCurrency(subtotal + vat);

      processedItems.push({
        product: product._id,
        productName: product.name,
        category: product.category,
        variantId: variant._id?.toString() ?? item.variantId,
        variantName: formatVariantSpecification(variant),
        quantity: item.quantity,
        unitPrice,
        costPrice: variant.costPrice,
        subtotal,
        vatRate,
        vat,
        total,
      });
    }

    const subtotal = this.roundCurrency(
      processedItems.reduce((sum, item) => sum + item.subtotal, 0),
    );
    const vat = this.roundCurrency(processedItems.reduce((sum, item) => sum + item.vat, 0));
    const total = this.roundCurrency(processedItems.reduce((sum, item) => sum + item.total, 0));

    const sale = new this.saleModel({
      cashier: new Types.ObjectId(cashierId),
      saleReference: `SAL-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      saleDate: new Date(),
      items: processedItems,
      subtotal,
      vat,
      total,
      paymentMethod: createSaleDto.paymentMethod ?? 'cash',
      paymentStatus: createSaleDto.paymentStatus ?? 'paid',
    });

    const deductedItems: typeof processedItems = [];
    try {
      for (const item of processedItems) {
        await this.inventoryService.deductSaleStock(
          {
            productId: item.product.toString(),
            variantId: item.variantId,
            quantity: item.quantity,
            reason: `Sale ${sale._id.toString()}`,
          },
          cashierId,
        );
        deductedItems.push(item);
      }

      const createdSale = await sale.save();
      return createdSale.populate('cashier');
    } catch (error) {
      for (const item of deductedItems.reverse()) {
        await this.inventoryService.addStock(
          {
            productId: item.product.toString(),
            variantId: item.variantId,
            quantity: item.quantity,
            reason: `Rollback failed sale ${sale._id.toString()}`,
          },
          cashierId,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.saleModel.find().populate('cashier').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    return this.saleModel.findById(id).populate('cashier').exec();
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
