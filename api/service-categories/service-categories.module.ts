import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceCategoriesService } from './service-categories.service';
import { ServiceCategoriesController } from './service-categories.controller';
import { ServiceCategory, ServiceCategorySchema } from './service-category.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceCategory.name, schema: ServiceCategorySchema }])],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
  exports: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
