import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyServicesService } from './company-services.service';
import { CompanyServicesController } from './company-services.controller';
import { CompanyService, CompanyServiceSchema } from './company-service.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CompanyService.name, schema: CompanyServiceSchema }])],
  controllers: [CompanyServicesController],
  providers: [CompanyServicesService],
  exports: [CompanyServicesService],
})
export class CompanyServicesModule {}
