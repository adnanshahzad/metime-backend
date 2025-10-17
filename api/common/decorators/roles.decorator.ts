import { SetMetadata } from '@nestjs/common';

export enum Role {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  MEMBER = 'member',
  CUSTOMER = 'customer',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
