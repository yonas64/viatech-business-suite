import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  declare createdAt: Date;
  declare updatedAt: Date;

  @Prop({ required: true, trim: true, lowercase: true, index: true })
  category: string;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ required: true, index: true })
  expenseDate: Date;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ trim: true, default: '' })
  reference?: string;

  @Prop({ trim: true, default: '' })
  receiptUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);