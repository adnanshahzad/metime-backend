import { IsOptional, IsBoolean, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyServiceDto {
  @ApiProperty({
    description: 'Company service active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Custom price for this company (overrides global service price)',
    example: 150.00,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @ApiProperty({
    description: 'Company-specific notes for this service',
    example: 'Updated notes for this service',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
