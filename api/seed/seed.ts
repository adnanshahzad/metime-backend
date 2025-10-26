import { connect, disconnect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { User, UserSchema } from '../users/user.schema';
import { Company, CompanySchema } from '../companies/company.schema';
import { ServiceCategory, ServiceCategorySchema } from '../service-categories/service-category.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import { CompanyService, CompanyServiceSchema } from '../company-services/company-service.schema';
import { Booking, BookingSchema } from '../bookings/booking.schema';
import { companies, superAdmin, getCompanyUsers, serviceCategories, services, getSampleBookings } from './data';
import { Role } from '../common/decorators/roles.decorator';

// Function to create a sample image
async function createSampleImage(): Promise<{ imagePath: string; thumbnailPath: string }> {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'services');
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
  
  // Ensure directories exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }

  // Create a simple sample image (1x1 pixel PNG with a gradient-like pattern)
  const fileName = `sample-service-${uuidv4()}.png`;
  const imagePath = path.join(uploadsDir, fileName);
  const thumbnailPath = path.join(thumbnailsDir, fileName);

  // Create a simple 400x400 image with a gradient background
  const imageBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 135, g: 206, b: 235 } // Sky blue background
    }
  })
  .png()
  .toBuffer();

  // Save original image
  fs.writeFileSync(imagePath, imageBuffer);

  // Create thumbnail (300x300)
  await sharp(imageBuffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .png({ quality: 80 })
    .toFile(thumbnailPath);

  return {
    imagePath: `uploads/services/${fileName}`,
    thumbnailPath: `uploads/services/thumbnails/${fileName}`
  };
}

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
    const BookingModel = require('mongoose').model('Booking', BookingSchema);

    if (command === 'refresh') {
      console.log('Dropping existing collections...');
      await UserModel.collection.drop().catch(() => {});
      await CompanyModel.collection.drop().catch(() => {});
      await ServiceCategoryModel.collection.drop().catch(() => {});
      await ServiceModel.collection.drop().catch(() => {});
      await CompanyServiceModel.collection.drop().catch(() => {});
      await BookingModel.collection.drop().catch(() => {});
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
        firstname: superAdmin.firstname,
        lastname: superAdmin.lastname,
        email: superAdmin.email,
        passwordHash,
        role: superAdmin.role,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Super Admin: ${adminUser.firstname} ${adminUser.lastname} (${adminUser.email})`);

    // Create company users
    for (const company of createdCompanies) {
      console.log(`Creating users for company: ${company.name}`);
      const companyUsers = getCompanyUsers(company.slug);
      
      for (const userData of companyUsers) {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const userPayload: any = {
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          passwordHash,
          role: userData.role,
          isActive: true,
        };
        // Only attach company to non-customer roles
        if (userData.role !== Role.CUSTOMER) {
          userPayload.companyId = company._id;
        }
        const user = await UserModel.findOneAndUpdate(
          { email: userData.email },
          userPayload,
          { upsert: true, new: true }
        );
        console.log(`  ✓ ${userData.role}: ${user.firstname} ${user.lastname} (${user.email})`);
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

    // Create sample image for all services
    console.log('Creating sample image...');
    const { imagePath, thumbnailPath } = await createSampleImage();
    console.log(`✓ Sample image created: ${imagePath}`);

    // Create services
    console.log('Creating services...');
    const createdServices = [];
    
    // Get category IDs
    const salonCategory = createdCategories.find(c => c.slug === 'salon');
    const spaCategory = createdCategories.find(c => c.slug === 'spa');
    
    for (const serviceData of services) {
      // Assign category based on service name
      let categoryId;
      const serviceName = serviceData.name.toLowerCase();
      
      // Salon services (previously therapy-oriented services)
      if (serviceName.includes('full body massage') || 
          serviceName.includes('deep tissue massage') || 
          serviceName.includes('back neck and shoulder therapy') || 
          serviceName.includes('couples massage') || 
          serviceName.includes('hot stone massage')) {
        categoryId = salonCategory?._id;
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
      // Default to salon if unclear
      else {
        categoryId = salonCategory?._id;
      }

      if (!categoryId) {
        console.error(`No category found for service: ${serviceData.name}`);
        continue;
      }

      // Remove the old images array and add our sample image
      const { images, ...serviceDataWithoutImages } = serviceData;
      const serviceWithImage = {
        ...serviceDataWithoutImages,
        categoryId,
        images: [imagePath],
        thumbnails: [thumbnailPath]
      };

      const service = await ServiceModel.findOneAndUpdate(
        { name: serviceData.name },
        serviceWithImage,
        { upsert: true, new: true }
      );
      createdServices.push(service);
      console.log(`✓ Service: ${service.name} (Category: ${createdCategories.find(c => c._id.toString() === categoryId.toString())?.name}) - Image: ${imagePath}`);
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

    // Create sample bookings
    console.log('Creating sample bookings...');
    const sampleBookings = getSampleBookings();
    const customerUsers = await UserModel.find({ role: Role.CUSTOMER }).limit(3);
    const companyMembers = await UserModel.find({ role: Role.MEMBER }).limit(2);
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const bookingData = sampleBookings[i];
      const customer = customerUsers[i % customerUsers.length];
      const service = createdServices[i % createdServices.length];
      
      // Update service ID in booking data
      bookingData.services[0].serviceId = service._id;
      
      // Add assignment data for some bookings
      let assignedCompanyId = undefined;
      let assignedUserId = undefined;
      let assignedBy = undefined;
      
      if (bookingData.status === 'assigned_to_company' || bookingData.status === 'assigned_to_member') {
        const company = createdCompanies[0]; // Assign to first company
        assignedCompanyId = company._id;
        assignedBy = adminUser._id;
        
        if (bookingData.status === 'assigned_to_member') {
          const member = companyMembers[0];
          assignedUserId = member._id;
        }
      }
      
      const booking = await BookingModel.create({
        ...bookingData,
        customerId: customer._id,
        assignedCompanyId,
        assignedUserId,
        assignedBy,
        services: bookingData.services.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
      });
      
      console.log(`✓ Booking: ${booking._id} (${bookingData.status}) - Customer: ${customer.email}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📸 All services now have the sample image: ${imagePath}`);
    console.log('\nTest accounts:');
    console.log('Super Admin: admin@example.com / 12345678');
    console.log('Company Admins: manager+metime@example.com / 12345678');
    console.log('Members: member+metime@example.com / 12345678');
    console.log('Customers: customer+metime@example.com / 12345678');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();