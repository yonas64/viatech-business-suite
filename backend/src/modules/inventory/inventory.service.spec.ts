import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ProductDocument } from '../products/schemas/product.schema';
import { InventoryMovementDocument } from './schemas/inventory-movement.schema';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  const productId = new Types.ObjectId().toString();
  const variantId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  let service: InventoryService;
  let productModel: {
    findById: jest.Mock;
    updateOne: jest.Mock;
  };
  let movementModel: { create: jest.Mock };
  let currentQuantity: number;

  beforeEach(() => {
    currentQuantity = 10;
    const product = {
      _id: new Types.ObjectId(productId),
      variants: [
        {
          _id: new Types.ObjectId(variantId),
          quantity: currentQuantity,
        },
      ],
    };
    productModel = {
      findById: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockImplementation(async () => {
          product.variants[0].quantity = currentQuantity;
          return product;
        }),
      })),
      updateOne: jest.fn().mockImplementation((_filter, update) => ({
        exec: jest.fn().mockImplementation(async () => {
          currentQuantity = update.$set['variants.$.quantity'];
          return { modifiedCount: 1 };
        }),
      })),
    };
    movementModel = {
      create: jest.fn().mockImplementation(async ([movement]) => [
        { ...movement, _id: new Types.ObjectId(), createdAt: new Date() },
      ]),
    };
    service = new InventoryService(
      productModel as unknown as Model<ProductDocument>,
      movementModel as unknown as Model<InventoryMovementDocument>,
      {} as never,
    );
  });

  it('atomically deducts a sale and records its authenticated cashier', async () => {
    const result = await service.deductSaleStock(
      { productId, variantId, quantity: 4, reason: 'Sale 123' },
      userId,
    );

    expect(result).toMatchObject({
      beforeQuantity: 10,
      afterQuantity: 6,
      movementType: 'sale',
      createdBy: userId,
    });
    expect(movementModel.create).toHaveBeenCalledWith([
      expect.objectContaining({
        movementType: 'sale',
        beforeQuantity: 10,
        afterQuantity: 6,
        createdBy: new Types.ObjectId(userId),
      }),
    ]);
  });

  it('rejects an issue that exceeds available stock without changing inventory', async () => {
    await expect(
      service.removeStock(
        { productId, variantId, quantity: 11, reason: 'Damaged stock' },
        userId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(productModel.updateOne).not.toHaveBeenCalled();
    expect(movementModel.create).not.toHaveBeenCalled();
  });

  it('sets the counted on-hand amount for an authorized stock correction', async () => {
    const result = await service.adjustStock(
      { productId, variantId, quantity: 3, reason: 'Physical stock count' },
      userId,
    );

    expect(result).toMatchObject({
      beforeQuantity: 10,
      afterQuantity: 3,
      movementType: 'adjustment',
    });
    expect(productModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: new Types.ObjectId(productId) }),
      { $set: { 'variants.$.quantity': 3 } },
    );
  });
});