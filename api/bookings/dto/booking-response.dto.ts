import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '../booking.schema';

export class BookingServiceResponseDto {
  @ApiProperty({ description: 'Service ID' })
  serviceId: string;

  @ApiProperty({ description: 'Company Service ID (if applicable)', required: false })
  companyServiceId?: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Custom price (if applicable)', required: false })
  customPrice?: number;

  @ApiProperty({ description: 'Service name' })
  serviceName: string;

  @ApiProperty({ description: 'Service duration in minutes' })
  serviceDuration: number;

  @ApiProperty({ description: 'Service price' })
  servicePrice: number;
}

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  _id: string;

  @ApiProperty({ description: 'Customer ID' })
  customerId: string;

  @ApiProperty({ description: 'Customer email' })
  customerEmail: string;

  @ApiProperty({ description: 'Array of services', type: [BookingServiceResponseDto] })
  services: BookingServiceResponseDto[];

  @ApiProperty({ description: 'Booking date' })
  bookingDate: Date;

  @ApiProperty({ description: 'Booking time' })
  bookingTime: string;

  @ApiProperty({ description: 'Total duration in minutes' })
  duration: number;

  @ApiProperty({ description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ description: 'Booking status', enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ description: 'Assigned company ID', required: false })
  assignedCompanyId?: string;

  @ApiProperty({ description: 'Assigned company name', required: false })
  assignedCompanyName?: string;

  @ApiProperty({ description: 'Assigned user ID', required: false })
  assignedUserId?: string;

  @ApiProperty({ description: 'Assigned user email', required: false })
  assignedUserEmail?: string;

  @ApiProperty({ description: 'Assigned by user ID', required: false })
  assignedBy?: string;

  @ApiProperty({ description: 'Assigned by user email', required: false })
  assignedByEmail?: string;

  @ApiProperty({ description: 'Customer notes', required: false })
  customerNotes?: string;

  @ApiProperty({ description: 'Admin notes', required: false })
  adminNotes?: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
