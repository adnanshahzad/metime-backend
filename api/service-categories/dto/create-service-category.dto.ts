import { IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategoryType } from '../service-category.schema';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Massage Therapy',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Service category type',
    enum: ServiceCategoryType,
    example: ServiceCategoryType.THERAPY,
  })
  @IsEnum(ServiceCategoryType)
  type: ServiceCategoryType;

  @ApiProperty({
    description: 'Service category slug (unique identifier)',
    example: 'massage-therapy',
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
    example: 'Various types of massage therapy services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
