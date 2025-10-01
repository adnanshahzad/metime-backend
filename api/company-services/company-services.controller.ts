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
import { CompanyServicesService } from './company-services.service';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';

@ApiTags('company-services')
@Controller('companies/:companyId/services')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyServicesController {
  constructor(private readonly companyServicesService: CompanyServicesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Attach a service to a company' })
  @ApiResponse({ status: 201, description: 'Service attached to company successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Service already attached to company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiBody({ type: CreateCompanyServiceDto })
  async create(
    @Param('companyId') companyId: string,
    @Body() createCompanyServiceDto: CreateCompanyServiceDto,
    @Request() req,
  ) {
    // Super admin can attach services to any company
    // Company admin can only attach services to their own company
    if (req.user.role === Role.COMPANY_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    return this.companyServicesService.create(companyId, createCompanyServiceDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all services for a company' })
  @ApiResponse({ status: 200, description: 'Company services retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  async findAll(@Param('companyId') companyId: string, @Request() req) {
    // Super admin can see services for any company
    // Others can only see services for their own company
    if (req.user.role !== Role.SUPER_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    return this.companyServicesService.findServicesByCompany(companyId);
  }

  @Get('active')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all active services for a company' })
  @ApiResponse({ status: 200, description: 'Active company services retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  async findActive(@Param('companyId') companyId: string, @Request() req) {
    // Super admin can see services for any company
    // Others can only see services for their own company
    if (req.user.role !== Role.SUPER_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    return this.companyServicesService.findActiveServices(companyId);
  }

  @Get(':serviceId')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get a specific service for a company' })
  @ApiResponse({ status: 200, description: 'Company service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  async findOne(
    @Param('companyId') companyId: string,
    @Param('serviceId') serviceId: string,
    @Request() req,
  ) {
    // Super admin can see services for any company
    // Others can only see services for their own company
    if (req.user.role !== Role.SUPER_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    const companyService = await this.companyServicesService.findOne(companyId, serviceId);
    if (!companyService) {
      return null;
    }

    return companyService;
  }

  @Patch(':serviceId')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Update a service for a company' })
  @ApiResponse({ status: 200, description: 'Company service updated successfully' })
  @ApiResponse({ status: 404, description: 'Company service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiBody({ type: UpdateCompanyServiceDto })
  async update(
    @Param('companyId') companyId: string,
    @Param('serviceId') serviceId: string,
    @Body() updateCompanyServiceDto: UpdateCompanyServiceDto,
    @Request() req,
  ) {
    // Super admin can update services for any company
    // Company admin can only update services for their own company
    if (req.user.role === Role.COMPANY_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    return this.companyServicesService.update(companyId, serviceId, updateCompanyServiceDto);
  }

  @Delete(':serviceId')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Detach a service from a company' })
  @ApiResponse({ status: 200, description: 'Service detached from company successfully' })
  @ApiResponse({ status: 404, description: 'Company service not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  async remove(
    @Param('companyId') companyId: string,
    @Param('serviceId') serviceId: string,
    @Request() req,
  ) {
    // Super admin can detach services from any company
    // Company admin can only detach services from their own company
    if (req.user.role === Role.COMPANY_ADMIN && req.user.companyId !== companyId) {
      return null;
    }

    return this.companyServicesService.remove(companyId, serviceId);
  }
}
