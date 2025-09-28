import { Role } from '../common/decorators/roles.decorator';

export const companies = [
  { name: 'metime', slug: 'metime' },
  { name: 'dts', slug: 'dts' },
  { name: 'gohar', slug: 'gohar' },
];

export const superAdmin = {
  email: 'admin@example.com',
  password: 'ChangeMe123!',
  role: Role.SUPER_ADMIN,
};

export const getCompanyUsers = (companySlug: string) => [
  {
    email: `manager+${companySlug}@example.com`,
    password: 'ChangeMe123!',
    role: Role.COMPANY_ADMIN,
  },
  {
    email: `member+${companySlug}@example.com`,
    password: 'ChangeMe123!',
    role: Role.MEMBER,
  },
  {
    email: `user+${companySlug}@example.com`,
    password: 'ChangeMe123!',
    role: Role.USER,
  },
];
