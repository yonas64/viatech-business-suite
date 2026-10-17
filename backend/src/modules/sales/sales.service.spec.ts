import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ProductDocument } from '../products/schemas/product.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleDocument } from './schemas/sale.schema';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  const productId = new Types.ObjectId();
  const firstVariantId = new Types.ObjectId();
  const secondVariantId = new Types.ObjectId();
  const cashierId = new Types.ObjectId().toString();

  let service: SalesService;
  let saleModel: jest.Mock;
  let savedSale: { populate: jest.Mock };
  let inventoryService: {
    deductSaleStock: jest.Mock;
    addStock: jest.Mock;
  };
  let saleData: Record<string, any>;

  beforeEach(() => {
    const product = {
      _id: productId,
      name: 'LED Power Supply',
      variants: [
        {
          _id: firstVariantId,
          sku: 'PSU-60W',
          specification: '60 W',
          sellingPrice: 10.1,
          vatRate: 0.15,
          quantity: 10,
        },
        {
          _id: secondVariantId,
          sku: 'PSU-100W',
          specification: '100 W',
          sellingPrice: 20,
          vatRate: 0,
          quantity: 5,
        },
      ],
    };
    const productModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(product) }),
    };
    savedSale = { populate: jest.fn().mockResolvedValue({ ok: true }) };
    saleModel = jest.fn().mockImplementation((data: Record<string, any>) => {
      saleData = data;
      return {
        ...data,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(savedSale),
      };
    });
    inventoryService = {
      deductSaleStock: jest.fn().mockResolvedValue({}),
      addStock: jest.fn().mockResolvedValue({}),
    };
    service = new SalesService(
      productModel as unknown as Model<ProductDocument>,
      saleModel as unknown as Model<SaleDocument>,
      inventoryService as unknown as InventoryService,
    );
  });

  it('calculates line totals and VAT from each variant and stores sale metadata', async () => {
    const dto: CreateSaleDto = {
      items: [
        {
          productId: productId.toString(),
          variantId: firstVariantId.toString(),
          quantity: 3,
        },
        {
          productId: productId.toString(),
          variantId: secondVariantId.toString(),
          quantity: 2,
        },
      ],
      paymentMethod: 'card',
      paymentStatus: 'pending',
    };

    await service.createSale(dto, cashierId);

    expect(saleData.items).toEqual([
      expect.objectContaining({
        quantity: 3,
        unitPrice: 10.1,
        subtotal: 30.3,
        vatRate: 0.15,
        vat: 4.55,
        total: 34.85,
      }),
      expect.objectContaining({
        quantity: 2,
        unitPrice: 20,
        subtotal: 40,
        vatRate: 0,
        vat: 0,
        total: 40,
      }),
    ]);
    expect(saleData).toMatchObject({
      subtotal: 70.3,
      vat: 4.55,
      total: 74.85,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      cashier: new Types.ObjectId(cashierId),
    });
    expect(saleData.saleReference).toMatch(/^SAL-\d+-[A-F0-9]{8}$/);
    expect(saleData.saleDate).toBeInstanceOf(Date);
    expect(inventoryService.deductSaleStock).toHaveBeenCalledTimes(2);
  });

  it('rejects a client price that differs from the saved variant price', async () => {
    await expect(
      service.createSale(
        {
          items: [
            {
              productId: productId.toString(),
              variantId: firstVariantId.toString(),
              quantity: 1,
              unitPrice: 1,
            },
          ],
        },
        cashierId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(saleModel).not.toHaveBeenCalled();
    expect(inventoryService.deductSaleStock).not.toHaveBeenCalled();
  });
});