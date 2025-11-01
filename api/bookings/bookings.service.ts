import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus, PaymentStatus } from './booking.schema';
import { User, UserDocument } from '../users/user.schema';
import { Company, CompanyDocument } from '../companies/company.schema';
import { Service, ServiceDocument } from '../services/service.schema';
import { CompanyService, CompanyServiceDocument } from '../company-services/company-service.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { AssignBookingToMemberDto } from './dto/assign-booking-to-member.dto';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CompanyMemberDto } from './dto/company-member.dto';
import { Role } from '../common/decorators/roles.decorator';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(CompanyService.name) private companyServiceModel: Model<CompanyServiceDocument>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto, customerId: string): Promise<BookingResponseDto> {
    const { services, bookingDate, bookingTime, customerNotes } = createBookingDto;

    // Validate booking date is in the future
    const bookingDateTime = new Date(bookingDate);
    const now = new Date();
    if (bookingDateTime <= now) {
      throw new BadRequestException('Booking date must be in the future');
    }

    // Validate and fetch services
    const validatedServices = await this.validateAndFetchServices(services);

    // Calculate total duration and price
    const { totalDuration, totalPrice } = this.calculateBookingTotals(validatedServices);

    // Validate total duration doesn't exceed 8 hours
    if (totalDuration > 480) {
      throw new BadRequestException('Total booking duration cannot exceed 8 hours');
    }

    // Check for scheduling conflicts
    await this.checkSchedulingConflicts(bookingDate, bookingTime, totalDuration);

    // Create booking
    const booking = new this.bookingModel({
      customerId: new Types.ObjectId(customerId),
      services: validatedServices.map(service => ({
        serviceId: service.serviceId,
        companyServiceId: service.companyServiceId,
        quantity: service.quantity,
        customPrice: service.customPrice,
      })),
      bookingDate: bookingDateTime,
      bookingTime,
      duration: totalDuration,
      totalPrice,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      customerNotes,
    });

    const savedBooking = await booking.save();
    return this.formatBookingResponse(savedBooking);
  }

  async getMyBookings(customerId: string, query: BookingListQueryDto): Promise<{ bookings: BookingResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: any = { customerId: new Types.ObjectId(customerId) };
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('customerId', 'email')
        .populate('assignedCompanyId', 'name')
        .populate('assignedUserId', 'email')
        .populate('assignedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    const formattedBookings = await Promise.all(
      bookings.map(booking => this.formatBookingResponse(booking))
    );

    return {
      bookings: formattedBookings,
      total,
      page,
      limit,
    };
  }

  async getBookingById(id: string, userId: string, userRole: Role): Promise<BookingResponseDto> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('customerId', 'email')
      .populate('assignedCompanyId', 'name')
      .populate('assignedUserId', 'email')
      .populate('assignedBy', 'email')
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check access permissions
    this.checkBookingAccess(booking, userId, userRole);

    return this.formatBookingResponse(booking);
  }

  async getAllBookings(query: BookingListQueryDto): Promise<{ bookings: BookingResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, paymentStatus, customerId, assignedCompanyId, assignedUserId, startDate, endDate, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = new Types.ObjectId(customerId);
    if (assignedCompanyId) filter.assignedCompanyId = new Types.ObjectId(assignedCompanyId);
    if (assignedUserId) filter.assignedUserId = new Types.ObjectId(assignedUserId);
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let queryBuilder = this.bookingModel.find(filter);

    // Handle search functionality
    if (search) {
      queryBuilder = queryBuilder.populate({
        path: 'customerId',
        match: { email: { $regex: search, $options: 'i' } },
      });
    }

    const [bookings, total] = await Promise.all([
      queryBuilder
        .populate('customerId', 'email')
        .populate('assignedCompanyId', 'name')
        .populate('assignedUserId', 'email')
        .populate('assignedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    const formattedBookings = await Promise.all(
      bookings.map(booking => this.formatBookingResponse(booking))
    );

    return {
      bookings: formattedBookings,
      total,
      page,
      limit,
    };
  }

  async getCompanyAssignedBookings(companyId: string, query: BookingListQueryDto): Promise<{ bookings: BookingResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Validate companyId
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      throw new BadRequestException('Invalid company ID');
    }

    const filter: any = { assignedCompanyId: new Types.ObjectId(companyId) };
    if (status) filter.status = status;

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('customerId', 'email')
        .populate('assignedCompanyId', 'name')
        .populate('assignedUserId', 'email')
        .populate('assignedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    const formattedBookings = await Promise.all(
      bookings.map(booking => this.formatBookingResponse(booking))
    );

    return {
      bookings: formattedBookings,
      total,
      page,
      limit,
    };
  }

  async getAssignedToMeBookings(userId: string, query: BookingListQueryDto): Promise<{ bookings: BookingResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: any = { assignedUserId: new Types.ObjectId(userId) };
    if (status) filter.status = status;

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('customerId', 'email')
        .populate('assignedCompanyId', 'name')
        .populate('assignedUserId', 'email')
        .populate('assignedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    const formattedBookings = await Promise.all(
      bookings.map(booking => this.formatBookingResponse(booking))
    );

    return {
      bookings: formattedBookings,
      total,
      page,
      limit,
    };
  }

  async cancelBooking(id: string, userId: string, userRole: Role): Promise<BookingResponseDto> {
    const booking = await this.bookingModel.findById(id).exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Members cannot cancel any booking
    if (userRole === Role.MEMBER) {
      throw new ForbiddenException('Members do not have permission to cancel bookings');
    }

    // Check if user can cancel this booking
    if (userRole !== Role.SUPER_ADMIN && booking.customerId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Check if booking can be cancelled
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled booking');
    }

    booking.status = BookingStatus.CANCELLED;
    const updatedBooking = await booking.save();

    return this.formatBookingResponse(updatedBooking);
  }

  async assignBooking(id: string, assignBookingDto: AssignBookingDto, assignedBy: string): Promise<BookingResponseDto> {
    const { companyId, userId, adminNotes } = assignBookingDto;

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate that at least one assignment is provided
    if (!companyId && !userId) {
      throw new BadRequestException('Either companyId or userId must be provided');
    }

    // Validate company exists if provided
    if (companyId) {
      const company = await this.companyModel.findById(companyId).exec();
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      booking.assignedCompanyId = new Types.ObjectId(companyId);
    }

    // Validate user exists and belongs to the assigned company if provided
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If companyId is also provided, validate user belongs to that company
      if (companyId && user.companyId?.toString() !== companyId) {
        throw new BadRequestException('User does not belong to the specified company');
      }

      // If no companyId provided but userId is, set companyId to user's company
      if (!companyId && user.companyId) {
        booking.assignedCompanyId = new Types.ObjectId(user.companyId);
      }

      booking.assignedUserId = new Types.ObjectId(userId);
    }

    // Set assignment tracking
    booking.assignedBy = new Types.ObjectId(assignedBy);
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    // Update status based on assignment
    if (userId) {
      booking.status = BookingStatus.ASSIGNED_TO_MEMBER;
    } else if (companyId) {
      booking.status = BookingStatus.ASSIGNED_TO_COMPANY;
    }

    const updatedBooking = await booking.save();
    return this.formatBookingResponse(updatedBooking);
  }

  async assignBookingToMember(id: string, assignBookingToMemberDto: AssignBookingToMemberDto, companyId: string, assignedBy: string): Promise<BookingResponseDto> {
    const { userId, adminNotes } = assignBookingToMemberDto;

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate booking is assigned to the company
    if (!booking.assignedCompanyId || booking.assignedCompanyId.toString() !== companyId) {
      throw new ForbiddenException('Booking is not assigned to your company');
    }

    // Validate user exists and belongs to the company
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.companyId?.toString() !== companyId) {
      throw new BadRequestException('User does not belong to your company');
    }

    // Update booking
    booking.assignedUserId = new Types.ObjectId(userId);
    booking.assignedBy = new Types.ObjectId(assignedBy);
    booking.status = BookingStatus.ASSIGNED_TO_MEMBER;
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    const updatedBooking = await booking.save();
    return this.formatBookingResponse(updatedBooking);
  }

  async updateBookingStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto, userId: string, userRole: Role): Promise<BookingResponseDto> {
    const { status, paymentStatus, adminNotes } = updateBookingStatusDto;

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions for status updates
    this.checkStatusUpdatePermissions(booking, userId, userRole, status);

    // Validate status transitions
    this.validateStatusTransition(booking.status, status);

    // Update booking
    booking.status = status;
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    const updatedBooking = await booking.save();
    return this.formatBookingResponse(updatedBooking);
  }

  async getCompanyMembers(companyId: string): Promise<CompanyMemberDto[]> {
    const members = await this.userModel
      .find({ companyId: new Types.ObjectId(companyId), isActive: true, role: Role.MEMBER })
      .populate('companyId', 'name')
      .exec();

    return members.map(member => ({
      _id: member._id.toString(),
      email: member.email,
      role: member.role,
      isActive: member.isActive,
      companyId: member.companyId?.toString() || '',
      companyName: (member.companyId as any)?.name || '',
    }));
  }

  async getUsersByCompany(companyId: string): Promise<CompanyMemberDto[]> {
    return this.getCompanyMembers(companyId);
  }

  // Private helper methods

  private async validateAndFetchServices(services: any[]): Promise<any[]> {
    const validatedServices = [];

    for (const service of services) {
      // Validate service exists and is active
      const serviceDoc = await this.serviceModel.findById(service.serviceId).exec();
      if (!serviceDoc || !serviceDoc.isActive) {
        throw new NotFoundException(`Service with ID ${service.serviceId} not found or inactive`);
      }

      let companyServiceDoc = null;
      if (service.companyServiceId) {
        companyServiceDoc = await this.companyServiceModel.findById(service.companyServiceId).exec();
        if (!companyServiceDoc || !companyServiceDoc.isActive) {
          throw new NotFoundException(`Company service with ID ${service.companyServiceId} not found or inactive`);
        }
      }

      validatedServices.push({
        serviceId: serviceDoc._id,
        companyServiceId: companyServiceDoc?._id,
        quantity: service.quantity,
        customPrice: service.customPrice,
        serviceDoc,
        companyServiceDoc,
      });
    }

    return validatedServices;
  }

  private calculateBookingTotals(validatedServices: any[]): { totalDuration: number; totalPrice: number } {
    let totalDuration = 0;
    let totalPrice = 0;

    for (const service of validatedServices) {
      const duration = service.serviceDoc.duration * service.quantity;
      totalDuration += duration;

      let price = service.serviceDoc.price;
      if (service.companyServiceDoc?.customPrice !== undefined) {
        price = service.companyServiceDoc.customPrice;
      }
      if (service.customPrice !== undefined) {
        price = service.customPrice;
      }

      totalPrice += price * service.quantity;
    }

    return { totalDuration, totalPrice };
  }

  private async checkSchedulingConflicts(bookingDate: string, bookingTime: string, duration: number): Promise<void> {
    // Normalize the day to UTC boundaries to reliably query all bookings on the same date
    const day = new Date(bookingDate);
    const startOfDay = new Date(day);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch all active bookings for this day (exclude completed/cancelled)
    const sameDayBookings = await this.bookingModel
      .find({
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
      })
      .exec();

    const toMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(bookingTime);
    const newEnd = newStart + duration; // duration already in minutes

    for (const b of sameDayBookings) {
      const existingStart = toMinutes(b.bookingTime);
      const existingEnd = existingStart + (b.duration || 0);
      const overlaps = newStart < existingEnd && existingStart < newEnd;
      if (overlaps) {
        throw new BadRequestException('Time slot conflicts with existing booking');
      }
    }
  }

  private formatTime(date: Date): string {
    return date.toISOString().substr(11, 5);
  }

  private checkBookingAccess(booking: BookingDocument, userId: string, userRole: Role): void {
    if (userRole === Role.SUPER_ADMIN) {
      return; // Super admin has access to all bookings
    }

    if (booking.customerId.toString() === userId) {
      return; // Customer can access their own bookings
    }

    if (userRole === Role.COMPANY_ADMIN && booking.assignedCompanyId) {
      // Check if user is admin of the assigned company
      // This would need to be validated at the controller level with user's company
      return;
    }

    if (userRole === Role.MEMBER && booking.assignedUserId?.toString() === userId) {
      return; // Member can access bookings assigned to them
    }

    throw new ForbiddenException('You do not have access to this booking');
  }

  private checkStatusUpdatePermissions(booking: BookingDocument, userId: string, userRole: Role, newStatus: BookingStatus): void {
    if (userRole === Role.SUPER_ADMIN) {
      return; // Super admin can update any status
    }

    if (userRole === Role.COMPANY_ADMIN) {
      // Company admin can only update status of bookings assigned to their company
      // This would need to be validated at the controller level
      return;
    }

    if (userRole === Role.MEMBER && booking.assignedUserId?.toString() === userId) {
      // Member can only update status of their assigned bookings
      const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED];
      if (!allowedStatuses.includes(newStatus)) {
        throw new ForbiddenException('You can only update status to confirmed, in_progress, or completed');
      }
      return;
    }

    throw new ForbiddenException('You do not have permission to update this booking status');
  }

  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): void {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.ASSIGNED_TO_COMPANY, BookingStatus.ASSIGNED_TO_MEMBER, BookingStatus.CANCELLED],
      [BookingStatus.ASSIGNED_TO_COMPANY]: [BookingStatus.ASSIGNED_TO_MEMBER, BookingStatus.CANCELLED],
      [BookingStatus.ASSIGNED_TO_MEMBER]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [], // No transitions from completed
      [BookingStatus.CANCELLED]: [], // No transitions from cancelled
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async formatBookingResponse(booking: BookingDocument): Promise<BookingResponseDto> {
    const populatedBooking = await this.bookingModel
      .findById(booking._id)
      .populate('customerId', 'email')
      .populate('assignedCompanyId', 'name')
      .populate('assignedUserId', 'email')
      .populate('assignedBy', 'email')
      .exec();

    // Fetch service details for each booking service
    const servicesWithDetails = await Promise.all(
      booking.services.map(async (service) => {
        const serviceDoc = await this.serviceModel.findById(service.serviceId).exec();
        return {
          serviceId: service.serviceId.toString(),
          companyServiceId: service.companyServiceId?.toString(),
          quantity: service.quantity,
          customPrice: service.customPrice,
          serviceName: serviceDoc?.name || 'Unknown Service',
          serviceDuration: serviceDoc?.duration || 0,
          servicePrice: serviceDoc?.price || 0,
        };
      })
    );

    return {
      _id: booking._id.toString(),
      customerId: booking.customerId.toString(),
      customerEmail: (populatedBooking?.customerId as any)?.email || '',
      services: servicesWithDetails,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      duration: booking.duration,
      totalPrice: booking.totalPrice,
      status: booking.status,
      assignedCompanyId: booking.assignedCompanyId?.toString(),
      assignedCompanyName: (populatedBooking?.assignedCompanyId as any)?.name || '',
      assignedUserId: booking.assignedUserId?.toString(),
      assignedUserEmail: (populatedBooking?.assignedUserId as any)?.email || '',
      assignedBy: booking.assignedBy?.toString(),
      assignedByEmail: (populatedBooking?.assignedBy as any)?.email || '',
      customerNotes: booking.customerNotes,
      adminNotes: booking.adminNotes,
      paymentStatus: booking.paymentStatus,
      createdAt: (booking as any).createdAt,
      updatedAt: (booking as any).updatedAt,
    };
  }
}
