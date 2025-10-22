import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { AssignBookingToMemberDto } from './dto/assign-booking-to-member.dto';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CompanyMemberDto } from './dto/company-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@Controller('v1/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('debug')
  @ApiOperation({ summary: 'Debug authentication (temporary)' })
  @ApiResponse({ status: 200, description: 'Debug info' })
  async debug(@Request() req) {
    return {
      message: 'Authentication successful',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  // Customer Endpoints (accessible by all authenticated users)

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req): Promise<BookingResponseDto> {
    return this.bookingsService.createBooking(createBookingDto, req.user.userId);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get customer\'s own bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyBookings(@Query() query: BookingListQueryDto, @Request() req) {
    return this.bookingsService.getMyBookings(req.user.userId, query);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel booking' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async cancelBooking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBooking(id, req.user.userId, req.user.role);
  }

  // Super Admin Endpoints

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all bookings with filtering and pagination (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin only' })
  async getAllBookings(@Query() query: BookingListQueryDto) {
    return this.bookingsService.getAllBookings(query);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign booking to company and/or specific member (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking assigned successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking, company, or user not found' })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin only' })
  async assignBooking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() assignBookingDto: AssignBookingDto,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.assignBooking(id, assignBookingDto, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update booking status (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin only' })
  async updateBookingStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(id, updateBookingStatusDto, req.user.userId, req.user.role);
  }

  @Patch(':id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add admin notes to booking (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin notes added successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin only' })
  async addAdminNotes(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: { adminNotes: string },
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(
      id,
      { status: undefined, adminNotes: body.adminNotes },
      req.user.userId,
      req.user.role,
    );
  }

  @Get('users/by-company/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all members of a specific company (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Company members retrieved successfully', type: [CompanyMemberDto] })
  @ApiResponse({ status: 403, description: 'Access denied - Super Admin only' })
  async getUsersByCompany(@Param('companyId', ParseObjectIdPipe) companyId: string): Promise<CompanyMemberDto[]> {
    return this.bookingsService.getUsersByCompany(companyId);
  }

  // Company Admin Endpoints

  @Get('company-assigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get bookings assigned to company (Company Admin only)' })
  @ApiResponse({ status: 200, description: 'Company assigned bookings retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Company Admin only' })
  async getCompanyAssignedBookings(@Query() query: BookingListQueryDto, @Request() req) {
    return this.bookingsService.getCompanyAssignedBookings(req.user.companyId, query);
  }

  @Patch(':id/assign-member')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Assign booking to company member (Company Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking assigned to member successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking or user not found' })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  @ApiResponse({ status: 403, description: 'Access denied - Company Admin only' })
  async assignBookingToMember(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() assignBookingToMemberDto: AssignBookingToMemberDto,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.assignBookingToMember(id, assignBookingToMemberDto, req.user.companyId, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Update booking status for company assigned bookings (Company Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied - Company Admin only' })
  async updateCompanyBookingStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(id, updateBookingStatusDto, req.user.userId, req.user.role);
  }

  @Get('users/company-members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get list of members in company (Company Admin only)' })
  @ApiResponse({ status: 200, description: 'Company members retrieved successfully', type: [CompanyMemberDto] })
  @ApiResponse({ status: 403, description: 'Access denied - Company Admin only' })
  async getCompanyMembers(@Request() req): Promise<CompanyMemberDto[]> {
    return this.bookingsService.getCompanyMembers(req.user.companyId);
  }

  // Company Member Endpoints

  @Get('assigned-to-me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Get bookings assigned to specific user (Member only)' })
  @ApiResponse({ status: 200, description: 'Assigned bookings retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Member only' })
  async getAssignedToMeBookings(@Query() query: BookingListQueryDto, @Request() req) {
    return this.bookingsService.getAssignedToMeBookings(req.user.userId, query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Update status for assigned bookings (Member only)' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied - Member only' })
  async updateMemberBookingStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(id, updateBookingStatusDto, req.user.userId, req.user.role);
  }

  // This route must be last to avoid conflicts with specific routes
  @Get(':id')
  @ApiOperation({ summary: 'Get specific booking details' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getBookingById(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.getBookingById(id, req.user.userId, req.user.role);
  }
}
