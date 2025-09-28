import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<CompanyDocument>) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyDocument> {
    const existingCompany = await this.companyModel.findOne({ slug: createCompanyDto.slug });
    if (existingCompany) {
      throw new ConflictException('Company with this slug already exists');
    }

    const company = new this.companyModel(createCompanyDto);
    return company.save();
  }

  async findAll(): Promise<CompanyDocument[]> {
    return this.companyModel.find().exec();
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return this.companyModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return this.companyModel.findOne({ slug }).exec();
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDocument | null> {
    if (updateCompanyDto.slug) {
      const existingCompany = await this.companyModel.findOne({ 
        slug: updateCompanyDto.slug,
        _id: { $ne: id }
      });
      if (existingCompany) {
        throw new ConflictException('Company with this slug already exists');
      }
    }

    return this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();
  }

  async remove(id: string): Promise<CompanyDocument | null> {
    return this.companyModel.findByIdAndDelete(id).exec();
  }

  async findActiveCompanies(): Promise<CompanyDocument[]> {
    return this.companyModel.find({ isActive: true }).exec();
  }

  async upsertBySlug(slug: string, data: Partial<CreateCompanyDto>): Promise<CompanyDocument> {
    return this.companyModel.findOneAndUpdate(
      { slug },
      data,
      { upsert: true, new: true }
    ).exec();
  }
}
