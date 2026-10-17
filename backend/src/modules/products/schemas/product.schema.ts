import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class ProductVariant {
  declare _id: Types.ObjectId;

  // Retained for compatibility with existing clients and persisted variants.
  @Prop({ trim: true, default: '' })
  specification?: string;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  sku: string;

  @Prop({ type: Object, default: {} })
  specifications: Record<string, unknown>;

  @Prop({ required: true, min: 0, default: 0 })
  costPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  sellingPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  quantity: number;

  @Prop({ default: 'pcs' })
  unit: string;

  @Prop({ min: 0, default: 5 })
  lowStockThreshold: number;

  @Prop({ min: 0, max: 1, default: 0.15 })
  vatRate: number;
}

const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ default: true })
  active: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// The field's unique multikey index prevents cross-product SKU duplicates; the
// service also checks for duplicates within one product's variants array.

export function formatVariantSpecification(
  variant: Pick<ProductVariant, 'specification' | 'specifications' | 'sku'>,
): string {
  if (variant.specification?.trim()) return variant.specification.trim();
  const attributes = Object.entries(variant.specifications ?? {})
    .map(([key, value]) => {
      const displayValue =
        typeof value === 'object' && value !== null
          ? (JSON.stringify(value) ?? '')
          : String(value);
      return `${key}: ${displayValue}`;
    })
    .join(', ');
  return attributes || variant.sku;
}
