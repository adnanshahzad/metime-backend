import { IsArray, IsDateString, IsString, IsOptional, IsNumber, IsEnum, ValidateNested, Min, Max, Matches, ArrayMinSize, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '../booking.schema';

export class CreateBookingServiceDto {
  @ApiProperty({
    description: 'Service ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Company Service ID (optional, for company-specific pricing)',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyServiceId?: string;

  @ApiProperty({
    description: 'Quantity of the service',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @ApiProperty({
    description: 'Custom price override (optional)',
    example: 150.00,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'Array of services to book',
    type: [CreateBookingServiceDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookingServiceDto)
  services: CreateBookingServiceDto[];

  @ApiProperty({
    description: 'Booking date (ISO string)',
    example: '2024-12-25T00:00:00.000Z',
  })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({
    description: 'Booking time (HH:MM format)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'bookingTime must be in HH:MM format',
  })
  bookingTime: string;

  @ApiProperty({
    description: 'Customer notes (optional)',
    example: 'Please call before arrival',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}
