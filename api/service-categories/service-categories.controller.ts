import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { ServiceCategoryType } from './service-category.schema';

@ApiTags('service-categories')
@Controller('service-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new service category (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Service category created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict - Service category with this slug already exists' })
  @ApiBody({ type: CreateServiceCategoryDto })
  async create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(createServiceCategoryDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Service categories retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ServiceCategoryType, description: 'Filter by service category type' })
  async findAll(@Query('type') type?: ServiceCategoryType) {
    return this.serviceCategoriesService.findAll(type);
  }

  @Get('active')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all active service categories' })
  @ApiResponse({ status: 200, description: 'Active service categories retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ServiceCategoryType, description: 'Filter by service category type' })
  async findActive(@Query('type') type?: ServiceCategoryType) {
    return this.serviceCategoriesService.findActiveCategories(type);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get service category by ID' })
  @ApiResponse({ status: 200, description: 'Service category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  async findOne(@Param('id') id: string) {
    const serviceCategory = await this.serviceCategoriesService.findById(id);
    if (!serviceCategory) {
      return null;
    }
    return serviceCategory;
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update service category by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Service category updated successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict - Service category with this slug already exists' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @ApiBody({ type: UpdateServiceCategoryDto })
  async update(@Param('id') id: string, @Body() updateServiceCategoryDto: UpdateServiceCategoryDto) {
    return this.serviceCategoriesService.update(id, updateServiceCategoryDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete service category by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Service category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  async remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }
}
