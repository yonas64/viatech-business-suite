import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto);
    try {
      return await category.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A category with this name already exists');
      }
      throw error;
    }
  }

  async findAll(
    query: CategoryQueryDto = new CategoryQueryDto(),
    includePagination = false,
  ) {
    if (!includePagination) {
      return this.categoryModel.find().sort({ createdAt: -1 }).exec();
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = query.search
      ? { name: { $regex: this.escapeRegex(query.search.trim()), $options: 'i' } }
      : {};
    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Category not found');
    }
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateDto: UpdateCategoryDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Category not found');
    }
    if (updateDto.specificationFields !== undefined) {
      await this.validateExistingProducts(id, updateDto.specificationFields);
    }
    try {
      const category = await this.categoryModel.findByIdAndUpdate(id, updateDto, {
        new: true,
        runValidators: true,
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A category with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const hasProducts = await this.productModel.exists({ category: category._id });
    if (hasProducts) {
      throw new ConflictException('Cannot delete a category that still has products');
    }
    await category.deleteOne();
    return { deleted: true, id };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async validateExistingProducts(
    categoryId: string,
    fields: NonNullable<UpdateCategoryDto['specificationFields']>,
  ) {
    const products = await this.productModel.find({ category: categoryId }).exec();
    for (const product of products) {
      for (const variant of product.variants) {
        const values = variant.specifications ?? {};
        for (const field of fields) {
          const value = values[field.key];
          if (value === undefined) {
            if (field.required !== false) {
              throw new BadRequestException(
                `Cannot require "${field.key}": an existing product variant is missing it`,
              );
            }
            continue;
          }
          const valid =
            (field.type === 'text' && typeof value === 'string' && value.trim() !== '') ||
            (field.type === 'number' &&
              typeof value === 'number' &&
              Number.isFinite(value) &&
              value >= 0) ||
            (field.type === 'dimensions' &&
              typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value) &&
              typeof (value as Record<string, unknown>).width === 'number' &&
              typeof (value as Record<string, unknown>).height === 'number' &&
              Number.isFinite((value as Record<string, number>).width) &&
              Number.isFinite((value as Record<string, number>).height) &&
              (value as Record<string, number>).width > 0 &&
              (value as Record<string, number>).height > 0 &&
              ((value as Record<string, unknown>).depth === undefined ||
                (typeof (value as Record<string, unknown>).depth === 'number' &&
                  Number.isFinite((value as Record<string, number>).depth) &&
                  (value as Record<string, number>).depth > 0)) &&
              Object.keys(value).every((key) => ['width', 'height', 'depth'].includes(key)));
          if (!valid) {
            throw new BadRequestException(
              `Cannot change category specification "${field.key}": an existing variant has an incompatible value`,
            );
          }
        }
        const allowedKeys = new Set(fields.map((field) => field.key));
        if (fields.length && Object.keys(values).some((key) => !allowedKeys.has(key))) {
          throw new BadRequestException(
            'Cannot remove specification fields that are still used by product variants',
          );
        }
      }
    }
  }
}
