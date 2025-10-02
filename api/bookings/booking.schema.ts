import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  ASSIGNED_TO_COMPANY = 'assigned_to_company',
  ASSIGNED_TO_MEMBER = 'assigned_to_member',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class BookingService {
  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CompanyService', required: false })
  companyServiceId?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  quantity: number;

  @Prop({ required: false, min: 0 })
  customPrice?: number;
}

export const BookingServiceSchema = SchemaFactory.createForClass(BookingService);

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: [BookingServiceSchema], required: true, minlength: 1 })
  services: BookingService[];

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ })
  bookingTime: string;

  @Prop({ required: true, min: 1, max: 480 }) // Max 8 hours
  duration: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
  assignedCompanyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assignedUserId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assignedBy?: Types.ObjectId;

  @Prop({ required: false, maxlength: 500 })
  customerNotes?: string;

  @Prop({ required: false, maxlength: 1000 })
  adminNotes?: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes for optimal query performance
BookingSchema.index({ customerId: 1, createdAt: -1 }); // Customer's booking history
BookingSchema.index({ assignedCompanyId: 1, status: 1 }); // Company's assigned bookings
BookingSchema.index({ assignedUserId: 1, status: 1 }); // User's assigned bookings
BookingSchema.index({ assignedBy: 1 }); // Assignment history tracking
BookingSchema.index({ bookingDate: 1, bookingTime: 1 }); // Scheduling conflicts
BookingSchema.index({ status: 1, createdAt: -1 }); // Admin booking management
BookingSchema.index({ customerId: 1, status: 1 }); // Customer bookings by status
BookingSchema.index({ assignedCompanyId: 1, assignedUserId: 1 }); // Company member assignments
