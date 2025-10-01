import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyServiceDocument = CompanyService & Document;

@Schema({ timestamps: true })
export class CompanyService {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false, min: 0 })
  customPrice?: number;

  @Prop({ required: false })
  notes?: string;
}

export const CompanyServiceSchema = SchemaFactory.createForClass(CompanyService);

// Compound unique index on companyId + serviceId
CompanyServiceSchema.index({ companyId: 1, serviceId: 1 }, { unique: true });

// Additional indexes for performance
CompanyServiceSchema.index({ companyId: 1 });
CompanyServiceSchema.index({ serviceId: 1 });
CompanyServiceSchema.index({ isActive: 1 });
