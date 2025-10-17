import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CompanyScopeGuard } from './company-scope.guard';
import { Role } from '../decorators/roles.decorator';

describe('CompanyScopeGuard', () => {
  let guard: CompanyScopeGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CompanyScopeGuard],
    }).compile();

    guard = module.get<CompanyScopeGuard>(CompanyScopeGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow super admin to access any company', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.SUPER_ADMIN, companyId: 'company-1' },
          params: { companyId: 'company-2' },
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow user to access their own company', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.COMPANY_ADMIN, companyId: 'company-1' },
          params: { companyId: 'company-1' },
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny user access to different company', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.COMPANY_ADMIN, companyId: 'company-1' },
          params: { companyId: 'company-2' },
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow('Access denied: Company scope violation');
  });

  it('should allow access when no company ID is requested', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.CUSTOMER, companyId: 'company-1' },
          params: {},
          body: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
