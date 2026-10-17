import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryMovementDocument = HydratedDocument<InventoryMovement>;

@Schema({ timestamps: true })
export class InventoryMovement {
  declare createdAt: Date;
  declare updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, trim: true })
  variantId: string;

  @Prop({ required: true, enum: ['in', 'out', 'adjustment', 'sale'], index: true })
  movementType: 'in' | 'out' | 'adjustment' | 'sale';

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  beforeQuantity: number;

  @Prop({ required: true, min: 0 })
  afterQuantity: number;

  @Prop({ default: '' })
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId | null;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
