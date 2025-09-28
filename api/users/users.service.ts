import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/decorators/roles.decorator';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      passwordHash,
    });

    return user.save();
  }

  async findAll(companyId?: string, role?: Role): Promise<UserDocument[]> {
    const filter: any = {};
    
    if (companyId) {
      filter.companyId = companyId;
    }
    
    if (role) {
      filter.role = role;
    }

    return this.userModel.find(filter).populate('companyId').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('companyId').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).populate('companyId').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    const updateData: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).populate('companyId').exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findByCompany(companyId: string): Promise<UserDocument[]> {
    return this.userModel.find({ companyId }).populate('companyId').exec();
  }

  async findActiveUsers(companyId?: string): Promise<UserDocument[]> {
    const filter: any = { isActive: true };
    
    if (companyId) {
      filter.companyId = companyId;
    }

    return this.userModel.find(filter).populate('companyId').exec();
  }
}
