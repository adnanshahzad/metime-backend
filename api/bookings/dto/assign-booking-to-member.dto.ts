import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
