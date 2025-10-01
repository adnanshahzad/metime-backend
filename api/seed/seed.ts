import { connect, disconnect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from '../users/user.schema';
import { Company, CompanySchema } from '../companies/company.schema';
import { ServiceCategory, ServiceCategorySchema } from '../service-categories/service-category.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import { CompanyService, CompanyServiceSchema } from '../company-services/company-service.schema';
import { companies, superAdmin, getCompanyUsers, serviceCategories, services } from './data';
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
    const ServiceCategoryModel = require('mongoose').model('ServiceCategory', ServiceCategorySchema);
    const ServiceModel = require('mongoose').model('Service', ServiceSchema);
    const CompanyServiceModel = require('mongoose').model('CompanyService', CompanyServiceSchema);

    if (command === 'refresh') {
      console.log('Dropping existing collections...');
      await UserModel.collection.drop().catch(() => {});
      await CompanyModel.collection.drop().catch(() => {});
      await ServiceCategoryModel.collection.drop().catch(() => {});
      await ServiceModel.collection.drop().catch(() => {});
      await CompanyServiceModel.collection.drop().catch(() => {});
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

    // Create service categories
    console.log('Creating service categories...');
    const createdCategories = [];
    for (const categoryData of serviceCategories) {
      const category = await ServiceCategoryModel.findOneAndUpdate(
        { slug: categoryData.slug },
        categoryData,
        { upsert: true, new: true }
      );
      createdCategories.push(category);
      console.log(`✓ Category: ${category.name} (${category.slug})`);
    }

    // Create services
    console.log('Creating services...');
    const createdServices = [];
    
    // Get category IDs
    const therapyCategory = createdCategories.find(c => c.slug === 'therapy');
    const spaCategory = createdCategories.find(c => c.slug === 'spa');
    
    for (const serviceData of services) {
      // Assign category based on service name
      let categoryId;
      const serviceName = serviceData.name.toLowerCase();
      
      // Therapy services
      if (serviceName.includes('full body massage') || 
          serviceName.includes('deep tissue massage') || 
          serviceName.includes('back neck and shoulder therapy') || 
          serviceName.includes('couples massage') || 
          serviceName.includes('hot stone massage')) {
        categoryId = therapyCategory?._id;
      } 
      // Spa services
      else if (serviceName.includes('facial') || 
               serviceName.includes('body wrap') || 
               serviceName.includes('body scrub') || 
               serviceName.includes('aromatherapy') || 
               serviceName.includes('manicure') || 
               serviceName.includes('pedicure')) {
        categoryId = spaCategory?._id;
      } 
      // Default to therapy if unclear
      else {
        categoryId = therapyCategory?._id;
      }

      if (!categoryId) {
        console.error(`No category found for service: ${serviceData.name}`);
        continue;
      }

      const service = await ServiceModel.findOneAndUpdate(
        { name: serviceData.name },
        { ...serviceData, categoryId },
        { upsert: true, new: true }
      );
      createdServices.push(service);
      console.log(`✓ Service: ${service.name} (Category: ${createdCategories.find(c => c._id.toString() === categoryId.toString())?.name})`);
    }

    // Create company-service attachments
    console.log('Creating company-service attachments...');
    for (const company of createdCompanies) {
      console.log(`Attaching services to company: ${company.name}`);
      
      // Attach all services to each company with some variations
      for (const service of createdServices) {
        const customPrice = service.price * (0.9 + Math.random() * 0.2); // 10% variation
        const isActive = Math.random() > 0.1; // 90% chance of being active
        
        await CompanyServiceModel.findOneAndUpdate(
          { companyId: company._id, serviceId: service._id },
          {
            companyId: company._id,
            serviceId: service._id,
            isActive,
            customPrice: Math.round(customPrice * 100) / 100,
            notes: isActive ? `Available at ${company.name}` : 'Currently unavailable',
          },
          { upsert: true, new: true }
        );
      }
      console.log(`  ✓ Attached ${createdServices.length} services to ${company.name}`);
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
