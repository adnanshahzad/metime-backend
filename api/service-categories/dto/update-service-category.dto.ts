import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Salon Updated',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'Service category slug (unique identifier)',
    example: 'salon-updated',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiProperty({
    description: 'Service category active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Service category description',
    example: 'Updated description for massage therapy services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
