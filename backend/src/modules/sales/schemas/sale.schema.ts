import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({ _id: false })
export class SaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  category?: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  variantId: string;

  @Prop({ required: true, trim: true })
  variantName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  costPrice: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  vat: number;

  @Prop({ required: true, min: 0, max: 1, default: 0.15 })
  vatRate: number;

  @Prop({ required: true, min: 0 })
  total: number;
}

const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class Sale {
  declare createdAt: Date;
  declare updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  cashier: Types.ObjectId;

  @Prop({ required: true, unique: true, sparse: true, trim: true, index: true })
  saleReference: string;

  @Prop({ required: true, default: Date.now, index: true })
  saleDate: Date;

  @Prop({ type: [SaleItemSchema], required: true })
  items: SaleItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  vat: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'cash', enum: ['cash', 'card', 'bank-transfer', 'other'] })
  paymentMethod: string;

  @Prop({ default: 'paid', enum: ['paid', 'pending'] })
  paymentStatus: 'paid' | 'pending';
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
