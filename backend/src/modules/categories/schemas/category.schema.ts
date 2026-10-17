import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ _id: false })
export class CategorySpecificationField {
  @Prop({ required: true, trim: true, match: /^[a-zA-Z][a-zA-Z0-9_]*$/ })
  key: string;

  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true, enum: ['text', 'number', 'dimensions'] })
  type: 'text' | 'number' | 'dimensions';

  @Prop({ default: true })
  required: boolean;

  @Prop({ trim: true, default: '' })
  unit?: string;
}

const CategorySpecificationFieldSchema =
  SchemaFactory.createForClass(CategorySpecificationField);

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: [CategorySpecificationFieldSchema], default: [] })
  specificationFields: CategorySpecificationField[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
