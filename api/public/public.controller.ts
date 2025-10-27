import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PublicServicesService } from './public-services.service';
import { PublicAuthService } from './public-auth.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicServicesService: PublicServicesService,
    private readonly publicAuthService: PublicAuthService,
  ) {}

  // ===== SERVICE ENDPOINTS =====

  @Get('services')
  @ApiOperation({ summary: 'Get all active services (public)' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by service category ID' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Filter by maximum price' })
  async getServices(
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
    
    return this.publicServicesService.getActiveServices({
      categoryId,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
    });
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID (public)' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async getServiceById(@Param('id') id: string) {
    return this.publicServicesService.getServiceById(id);
  }

  @Get('services/category/:categoryId')
  @ApiOperation({ summary: 'Get services by category ID (public)' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'categoryId', description: 'Service category ID' })
  async getServicesByCategory(@Param('categoryId') categoryId: string) {
    return this.publicServicesService.getServicesByCategory(categoryId);
  }

  // ===== SERVICE CATEGORY ENDPOINTS =====

  @Get('service-categories')
  @ApiOperation({ summary: 'Get all active service categories (public)' })
  @ApiResponse({ status: 200, description: 'Service categories retrieved successfully' })
  async getServiceCategories() {
    return this.publicServicesService.getActiveServiceCategories();
  }

  @Get('service-categories/:id')
  @ApiOperation({ summary: 'Get service category by ID (public)' })
  @ApiResponse({ status: 200, description: 'Service category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  async getServiceCategoryById(@Param('id') id: string) {
    return this.publicServicesService.getServiceCategoryById(id);
  }


  // ===== AUTHENTICATION ENDPOINTS =====

  @Post('auth/register')
  @ApiOperation({ summary: 'Register new customer (public)' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CustomerRegisterDto })
  async registerCustomer(@Body() customerRegisterDto: CustomerRegisterDto) {
    return this.publicAuthService.registerCustomer(customerRegisterDto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Customer login (public)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'customer@example.com' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['email', 'password']
    }
  })
  async loginCustomer(@Body() loginDto: { email: string; password: string }) {
    return this.publicAuthService.loginCustomer(loginDto);
  }
}
