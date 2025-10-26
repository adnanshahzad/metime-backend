import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { ImageUploadService } from './image-upload.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new service (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiBody({ type: CreateServiceDto })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by service category ID' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Filter by maximum price' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    // Convert string query parameters to numbers and validate
    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;
    
    // Check if conversion resulted in valid numbers
    if ((minPrice && isNaN(minPriceNum)) || (maxPrice && isNaN(maxPriceNum))) {
      throw new BadRequestException('Invalid price parameters. Please provide valid numbers for minPrice and maxPrice.');
    }
    
    // Check if price values are positive
    if ((minPriceNum !== undefined && minPriceNum < 0) || (maxPriceNum !== undefined && maxPriceNum < 0)) {
      throw new BadRequestException('Price parameters must be positive numbers.');
    }
    
    // Check if minPrice is not greater than maxPrice
    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice.');
    }
    
    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      return this.servicesService.findServicesByPriceRange(minPriceNum, maxPriceNum);
    }
    return this.servicesService.findAll(categoryId);
  }

  @Get('active')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get all active services' })
  @ApiResponse({ status: 200, description: 'Active services retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by service category ID' })
  async findActive(@Query('categoryId') categoryId?: string) {
    return this.servicesService.findActiveServices(categoryId);
  }

  @Get('category/:categoryId')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get services by category ID' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'categoryId', description: 'Service category ID' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.servicesService.findByCategory(categoryId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async findOne(@Param('id') id: string) {
    const service = await this.servicesService.findById(id);
    if (!service) {
      return null;
    }
    return service;
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update service by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiBody({ type: UpdateServiceDto })
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete service by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Post(':id/upload-image')
  @Roles(Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image for a service (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const service = await this.servicesService.findById(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }

    const { imagePath, thumbnailPath } = await this.imageUploadService.uploadImage(file);
    
    // Update service with new image paths
    const updatedService = await this.servicesService.addImage(id, imagePath, thumbnailPath);
    
    return {
      message: 'Image uploaded successfully',
      service: updatedService,
      imagePath,
      thumbnailPath,
    };
  }

  @Delete(':id/remove-image/:imageIndex')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove image from a service (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Image removed successfully' })
  @ApiResponse({ status: 404, description: 'Service not found or image index invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiParam({ name: 'imageIndex', description: 'Index of the image to remove' })
  async removeImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string,
  ) {
    const service = await this.servicesService.findById(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }

    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0 || index >= service.images.length) {
      throw new BadRequestException('Invalid image index');
    }

    const imagePath = service.images[index];
    const thumbnailPath = service.thumbnails[index];

    // Delete files from filesystem
    await this.imageUploadService.deleteImage(imagePath, thumbnailPath);

    // Remove from service
    const updatedService = await this.servicesService.removeImage(id, index);
    
    return {
      message: 'Image removed successfully',
      service: updatedService,
    };
  }
}
