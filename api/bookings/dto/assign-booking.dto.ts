import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../booking.schema';

export class AssignBookingDto {
  @ApiProperty({
    description: 'Company ID to assign booking to (optional)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({
    description: 'User ID to assign booking to (optional)',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Admin notes for the assignment (optional)',
    example: 'Assigned to best available technician',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

export class AssignBookingToMemberDto {
  @ApiProperty({
    description: 'User ID to assign booking to',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Admin notes for the assignment (optional)',
    example: 'Assigned to experienced technician',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
