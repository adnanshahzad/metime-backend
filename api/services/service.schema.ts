import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'ServiceCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  duration: number; // in minutes

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  thumbnails: string[];

  @Prop({ required: false })
  notes?: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes
ServiceSchema.index({ categoryId: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ price: 1 });
