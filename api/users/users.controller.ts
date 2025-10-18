import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Super admin can create users in any company
    // Company admin can only create users in their own company
    if (req.user.role === Role.COMPANY_ADMIN) {
      createUserDto.companyId = req.user.companyId;
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by user role' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company ID (Super Admin only)' })
  async findAll(@Request() req, @Query('role') role?: Role, @Query('companyId') companyId?: string) {
    // Super admin can see all users or filter by specific company
    // Others can only see users in their company
    let filterCompanyId: string | undefined;
    
    if (req.user.role === Role.SUPER_ADMIN) {
      // Super admin can filter by any company or see all
      filterCompanyId = companyId;
    } else {
      // Non-super admins are restricted to their own company
      filterCompanyId = req.user.companyId;
    }
    
    return this.usersService.findAll(filterCompanyId, role);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }

    // Super admin can see any user
    // Others can only see users in their company
    if (req.user.role !== Role.SUPER_ADMIN && user.companyId?.toString() !== req.user.companyId) {
      return null;
    }

    return user;
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }

    // Super admin can update any user
    // Company admin can only update users in their company
    if (req.user.role === Role.COMPANY_ADMIN && user.companyId?.toString() !== req.user.companyId) {
      return null;
    }

    // Enforce company scope for company admins: they cannot change companyId and it must remain their own company
    if (req.user.role === Role.COMPANY_ADMIN) {
      updateUserDto.companyId = req.user.companyId;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Replace or update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async replace(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Delegate to the same update logic to keep behavior consistent
    return this.update(id, updateUserDto, req);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }

    // Super admin can delete any user
    // Company admin can only delete users in their company
    if (req.user.role === Role.COMPANY_ADMIN && user.companyId?.toString() !== req.user.companyId) {
      return null;
    }

    return this.usersService.remove(id);
  }
}
