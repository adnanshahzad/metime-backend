import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceDocument> {
    const service = new this.serviceModel(createServiceDto);
    return service.save();
  }

  async findAll(categoryId?: string): Promise<ServiceDocument[]> {
    const filter: any = {};
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    return this.serviceModel.find(filter).populate('categoryId').sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel.findById(id).populate('categoryId').exec();
  }

  async findByCategory(categoryId: string): Promise<ServiceDocument[]> {
    return this.serviceModel.find({ categoryId }).populate('categoryId').sort({ name: 1 }).exec();
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceDocument | null> {
    return this.serviceModel.findByIdAndUpdate(id, updateServiceDto, { new: true }).populate('categoryId').exec();
  }

  async remove(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel.findByIdAndDelete(id).exec();
  }

  async findActiveServices(categoryId?: string): Promise<ServiceDocument[]> {
    const filter: any = { isActive: true };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    return this.serviceModel.find(filter).populate('categoryId').sort({ name: 1 }).exec();
  }

  async findServicesByPriceRange(minPrice?: number, maxPrice?: number): Promise<ServiceDocument[]> {
    const filter: any = {};
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    return this.serviceModel.find(filter).populate('categoryId').sort({ price: 1 }).exec();
  }

  async addImage(id: string, imagePath: string, thumbnailPath: string): Promise<ServiceDocument | null> {
    return this.serviceModel.findByIdAndUpdate(
      id,
      { 
        $push: { 
          images: imagePath,
          thumbnails: thumbnailPath
        }
      },
      { new: true }
    ).populate('categoryId').exec();
  }

  async removeImage(id: string, imageIndex: number): Promise<ServiceDocument | null> {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      return null;
    }

    // Remove the image and thumbnail at the specified index
    service.images.splice(imageIndex, 1);
    service.thumbnails.splice(imageIndex, 1);

    return service.save();
  }
}
