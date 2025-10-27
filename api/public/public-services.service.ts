// Public services service for unauthenticated access
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../services/service.schema';
import { ServiceCategory, ServiceCategoryDocument } from '../service-categories/service-category.schema';

export interface ServiceFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class PublicServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(ServiceCategory.name) private serviceCategoryModel: Model<ServiceCategoryDocument>,
  ) {}

  async getActiveServices(filters: ServiceFilters = {}): Promise<ServiceDocument[]> {
    const query: any = { isActive: true };
    
    if (filters.categoryId) {
      query.categoryId = filters.categoryId;
    }
    
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    return this.serviceModel
      .find(query)
      .populate('categoryId', 'name slug description')
      .sort({ name: 1 })
      .exec();
  }

  async getServiceById(id: string): Promise<ServiceDocument | null> {
    const service = await this.serviceModel
      .findById(id)
      .populate('categoryId', 'name slug description')
      .exec();
    
    if (!service || !service.isActive) {
      return null;
    }
    
    return service;
  }

  async getServicesByCategory(categoryId: string): Promise<ServiceDocument[]> {
    const category = await this.serviceCategoryModel.findById(categoryId);
    if (!category || !category.isActive) {
      throw new NotFoundException('Service category not found');
    }

    return this.serviceModel
      .find({ categoryId, isActive: true })
      .populate('categoryId', 'name slug description')
      .sort({ name: 1 })
      .exec();
  }

  async getActiveServiceCategories(): Promise<ServiceCategoryDocument[]> {
    return this.serviceCategoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async getServiceCategoryById(id: string): Promise<ServiceCategoryDocument | null> {
    const category = await this.serviceCategoryModel.findById(id);
    
    if (!category || !category.isActive) {
      return null;
    }
    
    return category;
  }

}
