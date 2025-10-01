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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
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
  constructor(private readonly servicesService: ServicesService) {}

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
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
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
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all active services' })
  @ApiResponse({ status: 200, description: 'Active services retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by service category ID' })
  async findActive(@Query('categoryId') categoryId?: string) {
    return this.servicesService.findActiveServices(categoryId);
  }

  @Get('category/:categoryId')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get services by category ID' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'categoryId', description: 'Service category ID' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.servicesService.findByCategory(categoryId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
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
}
