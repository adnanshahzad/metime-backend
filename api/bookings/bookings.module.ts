import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './booking.schema';
import { User, UserSchema } from '../users/user.schema';
import { Company, CompanySchema } from '../companies/company.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import { CompanyService, CompanyServiceSchema } from '../company-services/company-service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Service.name, schema: ServiceSchema },
      { name: CompanyService.name, schema: CompanyServiceSchema },
    ]),
    // Needed so BookingsController can check caller company slug
    // to grant cross-company assignment for Metime admins
    (require('../companies/companies.module') as typeof import('../companies/companies.module')).CompaniesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
