import { connect, disconnect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from '../users/user.schema';
import { Company, CompanySchema } from '../companies/company.schema';
import { companies, superAdmin, getCompanyUsers } from './data';
import { Role } from '../common/decorators/roles.decorator';

async function seed() {
  const command = process.argv[2];

  if (!command || !['all', 'refresh'].includes(command)) {
    console.error('Usage: node seed.ts [all|refresh]');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/metime';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get models
    const UserModel = require('mongoose').model('User', UserSchema);
    const CompanyModel = require('mongoose').model('Company', CompanySchema);

    if (command === 'refresh') {
      console.log('Dropping existing collections...');
      await UserModel.collection.drop().catch(() => {});
      await CompanyModel.collection.drop().catch(() => {});
      console.log('Collections dropped');
    }

    console.log('Starting seed process...');

    // Create companies
    console.log('Creating companies...');
    const createdCompanies = [];
    for (const companyData of companies) {
      const company = await CompanyModel.findOneAndUpdate(
        { slug: companyData.slug },
        companyData,
        { upsert: true, new: true }
      );
      createdCompanies.push(company);
      console.log(`✓ Company: ${company.name} (${company.slug})`);
    }

    // Create super admin
    console.log('Creating super admin...');
    const passwordHash = await bcrypt.hash(superAdmin.password, 10);
    const adminUser = await UserModel.findOneAndUpdate(
      { email: superAdmin.email },
      {
        email: superAdmin.email,
        passwordHash,
        role: superAdmin.role,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Super Admin: ${adminUser.email}`);

    // Create company users
    for (const company of createdCompanies) {
      console.log(`Creating users for company: ${company.name}`);
      const companyUsers = getCompanyUsers(company.slug);
      
      for (const userData of companyUsers) {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const user = await UserModel.findOneAndUpdate(
          { email: userData.email },
          {
            email: userData.email,
            passwordHash,
            role: userData.role,
            companyId: company._id,
            isActive: true,
          },
          { upsert: true, new: true }
        );
        console.log(`  ✓ ${userData.role}: ${user.email}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log('Super Admin: admin@example.com / ChangeMe123!');
    console.log('Company Admins: manager+metime@example.com / ChangeMe123!');
    console.log('Members: member+metime@example.com / ChangeMe123!');
    console.log('Users: user+metime@example.com / ChangeMe123!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
