import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { Role } from '../common/decorators/roles.decorator';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let companiesService: CompaniesService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    role: Role.USER,
    companyId: 'company-id',
    isActive: true,
    toObject: () => ({
      _id: 'user-id',
      email: 'test@example.com',
      role: Role.USER,
      companyId: 'company-id',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '15m',
                REFRESH_SECRET: 'test-refresh-secret',
                REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    companiesService = module.get<CompaniesService>(CompaniesService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'comparePassword').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        _id: 'user-id',
        email: 'test@example.com',
        role: Role.USER,
        companyId: 'company-id',
      });
    });

    it('should return null when credentials are invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'comparePassword').mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testpassword';
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testpassword';
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePassword('wrongpassword', hashedPassword);
      expect(result).toBe(false);
    });
  });
});
