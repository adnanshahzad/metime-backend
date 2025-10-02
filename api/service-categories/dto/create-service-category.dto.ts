import { IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategoryType } from '../service-category.schema';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Salon',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Service category type',
    enum: ServiceCategoryType,
    example: ServiceCategoryType.SALON,
  })
  @IsEnum(ServiceCategoryType)
  type: ServiceCategoryType;

  @ApiProperty({
    description: 'Service category slug (unique identifier)',
    example: 'salon',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  slug: string;

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
    example: 'Salon and beauty services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
