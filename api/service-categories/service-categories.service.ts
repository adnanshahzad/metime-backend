import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceCategory, ServiceCategoryDocument, ServiceCategoryType } from './service-category.schema';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(@InjectModel(ServiceCategory.name) private serviceCategoryModel: Model<ServiceCategoryDocument>) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategoryDocument> {
    const existingCategory = await this.serviceCategoryModel.findOne({ slug: createServiceCategoryDto.slug });
    if (existingCategory) {
      throw new ConflictException('Service category with this slug already exists');
    }

    const serviceCategory = new this.serviceCategoryModel(createServiceCategoryDto);
    return serviceCategory.save();
  }

  async findAll(type?: ServiceCategoryType): Promise<ServiceCategoryDocument[]> {
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }

    return this.serviceCategoryModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ServiceCategoryDocument | null> {
    return this.serviceCategoryModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<ServiceCategoryDocument | null> {
    return this.serviceCategoryModel.findOne({ slug }).exec();
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategoryDocument | null> {
    if (updateServiceCategoryDto.slug) {
      const existingCategory = await this.serviceCategoryModel.findOne({ 
        slug: updateServiceCategoryDto.slug,
        _id: { $ne: id }
      });
      if (existingCategory) {
        throw new ConflictException('Service category with this slug already exists');
      }
    }

    return this.serviceCategoryModel.findByIdAndUpdate(id, updateServiceCategoryDto, { new: true }).exec();
  }

  async remove(id: string): Promise<ServiceCategoryDocument | null> {
    return this.serviceCategoryModel.findByIdAndDelete(id).exec();
  }

  async findActiveCategories(type?: ServiceCategoryType): Promise<ServiceCategoryDocument[]> {
    const filter: any = { isActive: true };
    
    if (type) {
      filter.type = type;
    }

    return this.serviceCategoryModel.find(filter).sort({ name: 1 }).exec();
  }

  async upsertBySlug(slug: string, data: Partial<CreateServiceCategoryDto>): Promise<ServiceCategoryDocument> {
    return this.serviceCategoryModel.findOneAndUpdate(
      { slug },
      data,
      { upsert: true, new: true }
    ).exec();
  }
}
