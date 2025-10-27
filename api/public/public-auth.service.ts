// Public authentication service for customer registration and login
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/user.schema';
import { Role } from '../common/decorators/roles.decorator';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class PublicAuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async registerCustomer(customerRegisterDto: CustomerRegisterDto) {
    const { firstname, lastname, email, password, preferredCompanyId } = customerRegisterDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new customer user
    const newUser = new this.userModel({
      firstname,
      lastname,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.CUSTOMER,
      companyId: preferredCompanyId || undefined,
      isActive: true,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const payload = { 
      userId: savedUser._id.toString(), 
      email: savedUser.email, 
      role: savedUser.role 
    };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = savedUser.toObject();

    return {
      message: 'Customer registered successfully',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async loginCustomer(loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is a customer
    if (user.role !== Role.CUSTOMER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload = { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}
