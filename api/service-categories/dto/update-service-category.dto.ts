import { IsOptional, IsString, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategoryType } from '../service-category.schema';

export class UpdateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Massage Therapy Updated',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'Service category type',
    enum: ServiceCategoryType,
    example: ServiceCategoryType.THERAPY,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceCategoryType)
  type?: ServiceCategoryType;

  @ApiProperty({
    description: 'Service category slug (unique identifier)',
    example: 'massage-therapy-updated',
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
