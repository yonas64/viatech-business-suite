import { BadRequestException, ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CategoryDocument } from '../categories/schemas/category.schema';
import {
  InventoryMovementDocument,
} from '../inventory/schemas/inventory-movement.schema';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDocument } from './schemas/product.schema';
import { ProductsService } from './product.service';

describe('ProductsService', () => {
  const categoryId = '64b000000000000000000001';
  const category = {
    specificationFields: [
      { key: 'thickness', label: 'Thickness', type: 'number', required: true },
      { key: 'dimensions', label: 'Dimensions', type: 'dimensions', required: false },
    ],
  } as unknown as CategoryDocument;

  let service: ProductsService;
  let productModel: jest.Mock & { exists: jest.Mock; findById: jest.Mock };
  let saveProduct: jest.Mock;
  let categoryModel: { findById: jest.Mock };

  const productDto = (): CreateProductDto => ({
    name: 'Mica sheet',
    categoryId,
    variants: [
      {
        sku: 'mica-3mm',
        specification: '3 mm',
        specifications: {
          thickness: 3,
          dimensions: { width: 600, height: 300 },
        },
        costPrice: 10,
        sellingPrice: 15,
        quantity: 12,
      },
    ],
  });

  beforeEach(() => {
    saveProduct = jest.fn().mockResolvedValue({ _id: 'product-id' });
    productModel = Object.assign(
      jest.fn().mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        save: saveProduct,
      })),
      {
        exists: jest.fn().mockResolvedValue(null),
        findById: jest.fn(),
      },
    );
    categoryModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(category) }),
    };
    service = new ProductsService(
      productModel as unknown as Model<ProductDocument>,
      categoryModel as never,
      {} as Model<InventoryMovementDocument>,
      {} as Model<SaleDocument>,
    );
  });

  it('normalizes SKU and persists category-defined typed specifications', async () => {
    await service.create(productDto());

    expect(productModel).toHaveBeenCalledWith(
      expect.objectContaining({
        category: expect.anything(),
        variants: [
          expect.objectContaining({
            sku: 'MICA-3MM',
            specifications: {
              thickness: 3,
              dimensions: { width: 600, height: 300 },
            },
          }),
        ],
      }),
    );
    expect(saveProduct).toHaveBeenCalledTimes(1);
  });

  it('rejects a product variant missing a required category specification', async () => {
    const dto = productDto();
    dto.variants[0].specifications = {};

    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('rejects duplicate SKUs within one product', async () => {
    const dto = productDto();
    dto.variants.push({
      specification: dto.variants[0].specification,
      specifications: dto.variants[0].specifications,
      sku: ' MICA-3mm ',
      costPrice: dto.variants[0].costPrice,
      sellingPrice: dto.variants[0].sellingPrice,
      quantity: dto.variants[0].quantity,
    });

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('rejects a SKU already used by another product', async () => {
    productModel.exists.mockResolvedValue({ _id: 'existing-product' });

    await expect(service.create(productDto())).rejects.toBeInstanceOf(ConflictException);
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('rejects invalid dimensions', async () => {
    const dto = productDto();
    dto.variants[0].specifications!.dimensions = { width: -1, height: 300 };

    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(saveProduct).not.toHaveBeenCalled();
  });

  it('persists and returns updated variant quantity and cost', async () => {
    const variantId = '64b000000000000000000002';
    const variant = {
      _id: { toString: () => variantId },
      sku: 'MICA-3MM',
      specifications: { thickness: 3 },
      quantity: 12,
      costPrice: 10,
    };
    const product = {
      _id: { toString: () => '64b000000000000000000003' },
      category: { toString: () => categoryId },
      variants: [variant],
      save: jest.fn().mockResolvedValue(undefined),
    };
    productModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });

    const result = await service.updateVariant(
      '64b000000000000000000003',
      variantId,
      { quantity: 24, costPrice: 18 },
    );

    expect(product.save).toHaveBeenCalledTimes(1);
    expect(variant).toMatchObject({ quantity: 24, costPrice: 18 });
    expect(result).toBe(variant);
    expect(productModel.findById).toHaveBeenCalledTimes(2);
  });
});