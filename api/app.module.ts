import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggingModule } from './logging/logging.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { ServicesModule } from './services/services.module';
import { CompanyServicesModule } from './company-services/company-services.module';
import { BookingsModule } from './bookings/bookings.module';
import { RootController } from './root/root.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/metime',
      }),
    }),
    LoggingModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    ServiceCategoriesModule,
    ServicesModule,
    CompanyServicesModule,
    BookingsModule,
  ],
  controllers: [RootController],
})
export class AppModule {}
