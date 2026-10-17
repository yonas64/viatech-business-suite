import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/product.service';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AdjustStockDto, StockMovementDto } from './dto/create-stock-movement.dto';
import { MovementQueryDto, StockQueryDto } from './dto/stock-query.dto';
import {
  InventoryMovement,
  InventoryMovementDocument,
} from './schemas/inventory-movement.schema';

const MAX_STOCK_UPDATE_ATTEMPTS = 5;

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(InventoryMovement.name)
    private readonly inventoryMovementModel: Model<InventoryMovementDocument>,
    private readonly productsService: ProductsService,
  ) {}

  addStock(dto: StockMovementDto, userId: string) {
    return this.applyStockUpdate(dto, userId, 'in');
  }

  removeStock(dto: StockMovementDto, userId: string) {
    return this.applyStockUpdate(dto, userId, 'out');
  }

  deductSaleStock(dto: StockMovementDto, userId: string) {
    return this.applyStockUpdate(dto, userId, 'sale');
  }

  adjustStock(dto: AdjustStockDto, userId: string) {
    return this.applyStockUpdate(dto, userId, 'adjustment');
  }

  private async applyStockUpdate(
    dto: StockMovementDto,
    userId: string,
    movementType: 'in' | 'out' | 'adjustment' | 'sale',
  ) {
    if (!Types.ObjectId.isValid(dto.productId)) {
      throw new NotFoundException('Product not found');
    }
    if (!Types.ObjectId.isValid(dto.variantId)) {
      throw new NotFoundException('Product variant not found');
    }
    if (!Number.isFinite(dto.quantity) || dto.quantity < 0) {
      throw new BadRequestException('Quantity must be a finite non-negative number');
    }
    if (movementType !== 'adjustment' && dto.quantity <= 0) {
      throw new BadRequestException('Stock movement quantity must be greater than zero');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Authenticated user ID is invalid');
    }
    const reason = dto.reason?.trim();
    if (!reason) {
      throw new BadRequestException('A reason is required for every stock movement');
    }

    const productObjectId = new Types.ObjectId(dto.productId);
    const variantObjectId = new Types.ObjectId(dto.variantId);

    for (let attempt = 0; attempt < MAX_STOCK_UPDATE_ATTEMPTS; attempt += 1) {
      const product = await this.productModel.findById(productObjectId).exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const variant = product.variants.find(
        (item) => item._id?.toString() === variantObjectId.toString(),
      );
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      const beforeQuantity = variant.quantity;
      if (
        (movementType === 'out' || movementType === 'sale') &&
        beforeQuantity < dto.quantity
      ) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${beforeQuantity}; requested: ${dto.quantity}`,
        );
      }
      const afterQuantity =
        movementType === 'adjustment'
          ? dto.quantity
          : movementType === 'out' || movementType === 'sale'
            ? beforeQuantity - dto.quantity
            : beforeQuantity + dto.quantity;

      // Compare the quantity read above in the update filter. Concurrent requests
      // retry against the latest value, so a sale cannot drive stock below zero.
      const quantityMatch =
        movementType === 'out' || movementType === 'sale'
          ? { $eq: beforeQuantity, $gte: dto.quantity }
          : beforeQuantity;
      const updateResult = await this.productModel
        .updateOne(
          {
            _id: productObjectId,
            variants: {
              $elemMatch: {
                _id: variantObjectId,
                quantity: quantityMatch,
              },
            },
          },
          { $set: { 'variants.$.quantity': afterQuantity } },
        )
        .exec();

      if (updateResult.modifiedCount !== 1) continue;

      try {
        const [movement] = await this.inventoryMovementModel.create([
          {
            product: productObjectId,
            variantId: variantObjectId.toString(),
            movementType,
            quantity: dto.quantity,
            beforeQuantity,
            afterQuantity,
            reason,
            createdBy: new Types.ObjectId(userId),
          },
        ]);
        return {
          productId: dto.productId,
          variantId: dto.variantId,
          beforeQuantity,
          afterQuantity,
          movementType,
          reason,
          movementId: movement._id,
          createdBy: userId,
          createdAt: movement.createdAt,
        };
      } catch (error) {
        // Keep stock and its audit log aligned if the movement insert fails.
        await this.productModel
          .updateOne(
            {
              _id: productObjectId,
              variants: {
                $elemMatch: { _id: variantObjectId, quantity: afterQuantity },
              },
            },
            { $set: { 'variants.$.quantity': beforeQuantity } },
          )
          .exec();
        throw error;
      }
    }

    throw new ConflictException('Stock changed repeatedly; retry this movement');
  }

  async getCurrentStock(query: StockQueryDto) {
    if (query.variantId && !query.productId) {
      throw new BadRequestException('productId is required when variantId is provided');
    }

    if (query.productId) {
      const product = await this.productModel
        .findOne({ _id: query.productId, active: true })
        .populate('category')
        .exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      const variants = query.variantId
        ? product.variants.filter((item) => item._id?.toString() === query.variantId)
        : product.variants;
      if (query.variantId && variants.length === 0) {
        throw new NotFoundException('Product variant not found');
      }
      if (query.variantId) {
        return this.toStockItem(product, variants[0]);
      }
      return variants.map((variant) => this.toStockItem(product, variant));
    }

    const products = await this.productModel
      .find({ active: true })
      .populate('category')
      .sort({ name: 1 })
      .exec();
    return products.flatMap((product) =>
      product.variants.map((variant) => this.toStockItem(product, variant)),
    );
  }

  async findMovements(query: MovementQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.productId) filter.product = new Types.ObjectId(query.productId);
    if (query.variantId) filter.variantId = query.variantId;
    if (query.movementType) filter.movementType = query.movementType;
    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.$gte = new Date(query.from);
      if (query.to) createdAt.$lte = new Date(query.to);
      filter.createdAt = createdAt;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.inventoryMovementModel
        .find(filter)
        .populate('product')
        .populate('createdBy', 'name username email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.inventoryMovementModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  private toStockItem(
    product: ProductDocument,
    variant: ProductDocument['variants'][number],
  ) {
    const quantity = variant.quantity;
    const lowStockThreshold = variant.lowStockThreshold ?? 0;
    return {
      productId: product._id,
      productName: product.name,
      category: product.category,
      variantId: variant._id?.toString(),
      sku: variant.sku,
      specification: variant.specification,
      specifications: variant.specifications,
      quantity,
      unit: variant.unit,
      lowStockThreshold,
      isLowStock: quantity <= lowStockThreshold,
    };
  }
}