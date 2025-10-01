import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ServiceCategoryType {
  THERAPY = 'THERAPY',
  SPA = 'SPA',
}

export type ServiceCategoryDocument = ServiceCategory & Document;

@Schema({ timestamps: true })
export class ServiceCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ServiceCategoryType })
  type: ServiceCategoryType;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  description?: string;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategory);

// Indexes
ServiceCategorySchema.index({ slug: 1 });
ServiceCategorySchema.index({ type: 1 });
ServiceCategorySchema.index({ isActive: 1 });
