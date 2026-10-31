import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import {
  InventoryMovement,
  InventoryMovementDocument,
} from '../inventory/schemas/inventory-movement.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { CreateProductDto, ProductVariantDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import {
  formatVariantSpecification,
  Product,
  ProductDocument,
} from './schemas/product.schema';

type VariantInput = ProductVariantDto | UpdateProductVariantDto;

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovementDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.findCategory(createProductDto.categoryId);
    this.validateVariantSet(createProductDto.variants, category);
    const variants = createProductDto.variants.map((variant) =>
      this.toVariantFields(variant),
    );
    await this.ensureSkusAvailable(variants.map((variant) => variant.sku));
    const product = new this.productModel({
      name: createProductDto.name,
      description: createProductDto.description,
      variants,
      category: new Types.ObjectId(createProductDto.categoryId),
    });

    return this.saveWithDuplicateHandling(product);
  }

  async findAll(
    query: ProductQueryDto = new ProductQueryDto(),
    includePagination = false,
  ) {
    if (!includePagination) {
      return this.productModel
        .find({ active: true })
        .populate('category')
        .sort({ createdAt: -1 })
        .exec();
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = { active: query.active ?? true };

    if (query.categoryId) {
      filter.category = new Types.ObjectId(query.categoryId);
    }
    if (Boolean(query.specificationKey) !== Boolean(query.specificationValue)) {
      throw new BadRequestException(
        'specificationKey and specificationValue must be provided together',
      );
    }
    if (query.specificationKey && query.specificationValue !== undefined) {
      const rawValue = query.specificationValue;
      const numericValue = Number(rawValue);
      const comparableValues: Array<string | number> =
        rawValue.trim() !== '' && Number.isFinite(numericValue)
          ? [rawValue, numericValue]
          : [rawValue];
      filter.variants = {
        $elemMatch: {
          [`specifications.${query.specificationKey}`]: { $in: comparableValues },
        },
      };
    }
    if (query.search?.trim()) {
      const regex = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { 'variants.sku': regex },
        { 'variants.specification': regex },
      ];
    }

    const sortField =
      query.sortBy === 'sellingPrice' ? 'variants.sellingPrice' : query.sortBy ?? 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .sort({ [sortField]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    this.ensureValidId(id);
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateDto: UpdateProductDto) {
    this.ensureValidId(id);
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateDto.categoryId) {
      const category = await this.findCategory(updateDto.categoryId);
      this.validateVariantSet(product.variants, category);
      product.category = new Types.ObjectId(updateDto.categoryId);
    }
    if (updateDto.name !== undefined) product.name = updateDto.name.trim();
    if (updateDto.description !== undefined) product.description = updateDto.description;

    await this.saveWithDuplicateHandling(product);
    return this.productModel.findById(id).populate('category').exec();
  }

  async addVariant(productId: string, variantDto: ProductVariantDto) {
    const product = await this.getProduct(productId);
    const category = await this.findCategory(product.category.toString());
    const variant = this.toVariantFields(variantDto);
    this.validateVariantSet([...product.variants, variant] as ProductVariantDto[], category);
    await this.ensureSkusAvailable([variant.sku], product._id.toString());
    product.variants.push(variant as never);
    await this.saveWithDuplicateHandling(product);
    return product.variants[product.variants.length - 1];
  }

  async updateVariant(
    productId: string,
    variantId: string,
    updateDto: UpdateProductVariantDto,
  ) {
    const product = await this.getProduct(productId);
    const variant = product.variants.find((item) => item._id?.toString() === variantId);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    const category = await this.findCategory(product.category.toString());
    const update = this.sanitizeVariantUpdate(updateDto);
    if (update.sku !== undefined) update.sku = this.normalizeSku(update.sku);
    if (update.specifications !== undefined) {
      variant.specifications = update.specifications;
    }
    Object.assign(variant, update);
    this.validateVariantSet(product.variants as unknown as ProductVariantDto[], category);
    await this.ensureSkusAvailable([variant.sku], product._id.toString());
    await this.saveWithDuplicateHandling(product);
    const savedProduct = await this.productModel.findById(productId).exec();
    const savedVariant = savedProduct?.variants.find(
      (item) => item._id?.toString() === variantId,
    );
    if (!savedVariant) {
      throw new NotFoundException('Product variant not found after update');
    }
    return savedVariant;
  }

  async removeVariant(productId: string, variantId: string) {
    const product = await this.getProduct(productId);
    if (product.variants.length <= 1) {
      throw new BadRequestException('A product must have at least one variant');
    }
    const variant = product.variants.find((item) => item._id?.toString() === variantId);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const [movementExists, saleExists] = await Promise.all([
      this.movementModel.exists({ product: product._id, variantId }),
      this.saleModel.exists({ items: { $elemMatch: { product: product._id, variantId } } }),
    ]);
    if (movementExists || saleExists) {
      throw new ConflictException('Cannot delete a variant referenced by inventory or sales history');
    }

    product.variants.splice(product.variants.indexOf(variant), 1);
    await this.saveWithDuplicateHandling(product);
    return { deleted: true, productId, variantId };
  }

  async remove(id: string) {
    this.ensureValidId(id);
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { deleted: true, id };
  }

  async findVariantById(productId: string, variantId: string) {
    const product = await this.getProduct(productId);
    const variant = product.variants.find((item) => item._id?.toString() === variantId);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    return { product, variant };
  }

  async getLowStockProducts() {
    const products = await this.productModel.find({ active: true }).exec();
    return products.flatMap((product) =>
      product.variants
        .filter((variant) => variant.quantity <= (variant.lowStockThreshold ?? 0))
        .map((variant) => ({
          productId: product._id,
          productName: product.name,
          variantId: variant._id?.toString() ?? 'unknown',
          specification: formatVariantSpecification(variant),
          specifications: variant.specifications,
          sku: variant.sku,
          quantity: variant.quantity,
          lowStockThreshold: variant.lowStockThreshold ?? 0,
        })),
    );
  }

  private async findCategory(categoryId: string) {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException('Category not found');
    }
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async getProduct(id: string) {
    this.ensureValidId(id);
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async ensureSkusAvailable(skus: string[], exceptProductId?: string) {
    const normalizedSkus = [...new Set(skus.map((sku) => this.normalizeSku(sku)))];
    if (normalizedSkus.length === 0) return;
    const filter: Record<string, unknown> = {
      'variants.sku': {
        $in: normalizedSkus.map((sku) => new RegExp(`^${this.escapeRegex(sku)}$`, 'i')),
      },
    };
    if (exceptProductId) {
      filter._id = { $ne: new Types.ObjectId(exceptProductId) };
    }
    const duplicate = await this.productModel.exists(filter);
    if (duplicate) {
      throw new ConflictException('A product variant with this SKU already exists');
    }
  }

  private validateVariantSet(variants: VariantInput[], category: CategoryDocument) {
    const seenSkus = new Set<string>();
    for (const variant of variants) {
      if (typeof variant.sku !== 'string' || variant.sku.trim().length === 0) {
        throw new BadRequestException('Every product variant must have a SKU');
      }
      const sku = this.normalizeSku(variant.sku);
      if (seenSkus.has(sku)) {
        throw new ConflictException(`Duplicate SKU in product variants: ${sku}`);
      }
      seenSkus.add(sku);
      this.validateSpecifications(variant.specifications ?? {}, category);
    }
  }

  private validateSpecifications(
    specifications: Record<string, unknown>,
    category: CategoryDocument,
  ) {
    for (const [key, value] of Object.entries(specifications)) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        throw new BadRequestException(`Invalid product specification key: ${key}`);
      }
      const definition = category.specificationFields?.find((field) => field.key === key);
      if (category.specificationFields?.length && !definition) {
        throw new BadRequestException(`Specification "${key}" is not defined for this category`);
      }
      if (!definition) {
        this.validateGenericSpecification(key, value);
        continue;
      }

      if (definition.type === 'text') {
        if (typeof value !== 'string' || value.trim().length === 0) {
          throw new BadRequestException(`Specification "${key}" must be non-empty text`);
        }
      } else if (definition.type === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          throw new BadRequestException(`Specification "${key}" must be a non-negative number`);
        }
      } else {
        this.validateDimensions(key, value);
      }
    }

    for (const field of category.specificationFields ?? []) {
      if (field.required !== false && specifications[field.key] === undefined) {
        throw new BadRequestException(`Specification "${field.key}" is required`);
      }
    }
  }

  private validateGenericSpecification(key: string, value: unknown) {
    if (typeof value === 'string' && value.trim().length > 0) return;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      this.validateDimensions(key, value);
      return;
    }
    throw new BadRequestException(`Specification "${key}" must be text, a number, or dimensions`);
  }

  private validateDimensions(key: string, value: unknown) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException(`Specification "${key}" must contain width and height`);
    }
    const dimensions = value as Record<string, unknown>;
    const allowedKeys = ['width', 'height', 'depth'];
    if (
      typeof dimensions.width !== 'number' ||
      typeof dimensions.height !== 'number' ||
      dimensions.width <= 0 ||
      dimensions.height <= 0 ||
      (dimensions.depth !== undefined &&
        (typeof dimensions.depth !== 'number' || dimensions.depth <= 0)) ||
      Object.keys(dimensions).some((dimension) => !allowedKeys.includes(dimension))
    ) {
      throw new BadRequestException(
        `Specification "${key}" dimensions must contain positive width and height, with optional positive depth`,
      );
    }
  }

  private async saveWithDuplicateHandling(product: ProductDocument) {
    try {
      return await product.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A product variant with this SKU already exists');
      }
      if (error instanceof MongooseError.ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private normalizeSku(sku: string): string {
    return sku.trim().toUpperCase();
  }

  private ensureValidId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Product not found');
    }
  }

  private sanitizeVariantUpdate(dto: UpdateProductVariantDto): UpdateProductVariantDto {
    const update: UpdateProductVariantDto = {};
    if (dto.specification !== undefined) update.specification = dto.specification;
    if (dto.specifications !== undefined) update.specifications = dto.specifications;
    if (dto.sku !== undefined) update.sku = dto.sku;
    if (dto.costPrice !== undefined) update.costPrice = dto.costPrice;
    if (dto.sellingPrice !== undefined) update.sellingPrice = dto.sellingPrice;
    if (dto.quantity !== undefined) update.quantity = dto.quantity;
    if (dto.unit !== undefined) update.unit = dto.unit;
    if (dto.lowStockThreshold !== undefined) update.lowStockThreshold = dto.lowStockThreshold;
    if (dto.vatRate !== undefined) update.vatRate = dto.vatRate;
    return update;
  }

  private toVariantFields(variant: ProductVariantDto) {
    return {
      specification: variant.specification,
      specifications: variant.specifications ?? {},
      sku: this.normalizeSku(variant.sku),
      costPrice: variant.costPrice,
      sellingPrice: variant.sellingPrice,
      quantity: variant.quantity,
      unit: variant.unit,
      lowStockThreshold: variant.lowStockThreshold,
      vatRate: variant.vatRate,
    };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}