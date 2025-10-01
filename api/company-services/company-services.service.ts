import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyService, CompanyServiceDocument } from './company-service.schema';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';

@Injectable()
export class CompanyServicesService {
  constructor(@InjectModel(CompanyService.name) private companyServiceModel: Model<CompanyServiceDocument>) {}

  async create(companyId: string, createCompanyServiceDto: CreateCompanyServiceDto): Promise<CompanyServiceDocument> {
    // Convert string companyId to ObjectId for proper querying
    const objectId = new Types.ObjectId(companyId);
    const serviceObjectId = new Types.ObjectId(createCompanyServiceDto.serviceId);
    
    // Check if the company-service relationship already exists
    const existingCompanyService = await this.companyServiceModel.findOne({
      companyId: objectId,
      serviceId: serviceObjectId,
    });

    if (existingCompanyService) {
      throw new ConflictException('This service is already attached to the company');
    }

    const companyService = new this.companyServiceModel({
      ...createCompanyServiceDto,
      companyId: objectId,
      serviceId: serviceObjectId,
    });

    return companyService.save();
  }

  async findAll(companyId: string): Promise<CompanyServiceDocument[]> {
    const objectId = new Types.ObjectId(companyId);
    return this.companyServiceModel
      .find({ companyId: objectId })
      .populate('serviceId')
      .populate('companyId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(companyId: string, serviceId: string): Promise<CompanyServiceDocument | null> {
    const companyObjectId = new Types.ObjectId(companyId);
    const serviceObjectId = new Types.ObjectId(serviceId);
    return this.companyServiceModel
      .findOne({ companyId: companyObjectId, serviceId: serviceObjectId })
      .populate('serviceId')
      .populate('companyId')
      .exec();
  }

  async update(
    companyId: string,
    serviceId: string,
    updateCompanyServiceDto: UpdateCompanyServiceDto,
  ): Promise<CompanyServiceDocument | null> {
    const companyObjectId = new Types.ObjectId(companyId);
    const serviceObjectId = new Types.ObjectId(serviceId);
    return this.companyServiceModel
      .findOneAndUpdate(
        { companyId: companyObjectId, serviceId: serviceObjectId },
        updateCompanyServiceDto,
        { new: true }
      )
      .populate('serviceId')
      .populate('companyId')
      .exec();
  }

  async remove(companyId: string, serviceId: string): Promise<CompanyServiceDocument | null> {
    const companyObjectId = new Types.ObjectId(companyId);
    const serviceObjectId = new Types.ObjectId(serviceId);
    return this.companyServiceModel.findOneAndDelete({ companyId: companyObjectId, serviceId: serviceObjectId }).exec();
  }

  async findActiveServices(companyId: string): Promise<CompanyServiceDocument[]> {
    const objectId = new Types.ObjectId(companyId);
    return this.companyServiceModel
      .find({ companyId: objectId, isActive: true })
      .populate('serviceId')
      .populate('companyId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findServicesByCompany(companyId: string): Promise<CompanyServiceDocument[]> {
    // Convert string companyId to ObjectId for proper querying
    const objectId = new Types.ObjectId(companyId);
    return this.companyServiceModel
      .find({ companyId: objectId })
      .populate({
        path: 'serviceId',
        populate: {
          path: 'categoryId',
        },
      })
      .populate('companyId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findCompaniesByService(serviceId: string): Promise<CompanyServiceDocument[]> {
    const objectId = new Types.ObjectId(serviceId);
    return this.companyServiceModel
      .find({ serviceId: objectId })
      .populate('companyId')
      .populate('serviceId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async bulkCreate(companyId: string, serviceIds: string[]): Promise<CompanyServiceDocument[]> {
    const companyObjectId = new Types.ObjectId(companyId);
    const companyServices = serviceIds.map(serviceId => ({
      companyId: companyObjectId,
      serviceId: new Types.ObjectId(serviceId),
      isActive: true,
    }));

    // Use insertMany with ordered: false to handle duplicates gracefully
    try {
      return await this.companyServiceModel.insertMany(companyServices, { ordered: false });
    } catch (error) {
      // If there are duplicate key errors, we can ignore them
      // and return the successfully inserted documents
      if (error.code === 11000) {
        // Return existing documents for the company
        return this.findAll(companyId);
      }
      throw error;
    }
  }
}
