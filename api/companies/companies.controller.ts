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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { CompanyServicesService } from '../company-services/company-services.service';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@ApiBearerAuth('JWT-auth')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyServicesService: CompanyServicesService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new company (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all companies (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get company by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete company by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Get(':id/services')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all services for a company (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Company services retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin role required' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async getCompanyServices(@Param('id') companyId: string) {
    return this.companyServicesService.findServicesByCompany(companyId);
  }
}
