import { IsString, MinLength, IsOptional, IsBoolean, IsNumber, IsArray, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Deep Tissue Massage',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'A therapeutic massage technique that focuses on realigning deeper layers of muscles and connective tissue',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 60,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Service price',
    example: 120.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Service active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Service images URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Service notes',
    example: 'Recommended for chronic pain and muscle tension',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
