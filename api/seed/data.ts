import { Role } from '../common/decorators/roles.decorator';
import { ServiceCategoryType } from '../service-categories/service-category.schema';
import { BookingStatus, PaymentStatus } from '../bookings/booking.schema';

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

export const serviceCategories = [
  {
    name: 'Salon',
    type: ServiceCategoryType.SALON,
    slug: 'salon',
    description: 'Professional salon and beauty services',
    isActive: true,
  },
  {
    name: 'Spa',
    type: ServiceCategoryType.SPA,
    slug: 'spa',
    description: 'Relaxing spa treatments and wellness services',
    isActive: true,
  },
];

export const services = [
  // Therapy Services
  {
    name: 'Full Body Massage',
    description: 'A comprehensive therapeutic massage covering the entire body to relieve tension and promote relaxation',
    duration: 90,
    price: 140.00,
    images: ['https://example.com/full-body-1.jpg', 'https://example.com/full-body-2.jpg'],
    notes: 'Complete body treatment for overall wellness',
    isActive: true,
  },
  {
    name: 'Deep Tissue Massage',
    description: 'A therapeutic massage technique that focuses on realigning deeper layers of muscles and connective tissue',
    duration: 60,
    price: 120.00,
    images: ['https://example.com/deep-tissue-1.jpg', 'https://example.com/deep-tissue-2.jpg'],
    notes: 'Recommended for chronic pain and muscle tension',
    isActive: true,
  },
  {
    name: 'Back Neck and Shoulder Therapy',
    description: 'Targeted therapeutic treatment focusing on the upper body to relieve tension and improve mobility',
    duration: 45,
    price: 90.00,
    images: ['https://example.com/back-neck-shoulder-1.jpg'],
    notes: 'Perfect for office workers and those with upper body tension',
    isActive: true,
  },
  {
    name: 'Couples Massage',
    description: 'Side-by-side therapeutic massage experience for couples in a relaxing environment',
    duration: 60,
    price: 200.00,
    images: ['https://example.com/couples-1.jpg', 'https://example.com/couples-2.jpg'],
    notes: 'Shared experience for two people in the same room',
    isActive: true,
  },
  {
    name: 'Hot Stone Massage',
    description: 'A therapeutic massage that uses heated stones to relax muscles and improve circulation',
    duration: 90,
    price: 150.00,
    images: ['https://example.com/hot-stone-1.jpg', 'https://example.com/hot-stone-2.jpg'],
    notes: 'Great for deep muscle relaxation and stress relief',
    isActive: true,
  },
  // Spa Services
  {
    name: 'Signature Facial',
    description: 'A comprehensive facial treatment that cleanses, exfoliates, and nourishes the skin',
    duration: 60,
    price: 95.00,
    images: ['https://example.com/signature-facial-1.jpg'],
    notes: 'Customized treatment for all skin types',
    isActive: true,
  },
  {
    name: 'Deep Cleansing Facial',
    description: 'Intensive facial treatment designed to deeply cleanse and purify the skin',
    duration: 75,
    price: 110.00,
    images: ['https://example.com/deep-cleansing-1.jpg'],
    notes: 'Ideal for acne-prone and oily skin',
    isActive: true,
  },
  {
    name: 'Anti-Aging Facial',
    description: 'Advanced facial treatment targeting fine lines, wrinkles, and age spots',
    duration: 90,
    price: 130.00,
    images: ['https://example.com/anti-aging-1.jpg'],
    notes: 'Features premium anti-aging ingredients',
    isActive: true,
  },
  {
    name: 'Body Wrap Treatment',
    description: 'Detoxifying body wrap that nourishes the skin and promotes relaxation',
    duration: 60,
    price: 85.00,
    images: ['https://example.com/body-wrap-1.jpg'],
    notes: 'Available in various therapeutic blends',
    isActive: true,
  },
  {
    name: 'Exfoliating Body Scrub',
    description: 'Invigorating body scrub that removes dead skin cells and leaves skin silky smooth',
    duration: 45,
    price: 75.00,
    images: ['https://example.com/body-scrub-1.jpg'],
    notes: 'Choose from sea salt, sugar, or coffee scrubs',
    isActive: true,
  },
  {
    name: 'Aromatherapy Treatment',
    description: 'Relaxing spa treatment combining essential oils with gentle massage techniques',
    duration: 60,
    price: 100.00,
    images: ['https://example.com/aromatherapy-1.jpg'],
    notes: 'Customizable essential oil blends for your needs',
    isActive: true,
  },
  {
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service including shaping, cuticle care, and polish application',
    duration: 90,
    price: 65.00,
    images: ['https://example.com/manicure-pedicure-1.jpg'],
    notes: 'Includes hand and foot massage',
    isActive: true,
  },
];

export const getSampleBookings = () => [
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 1,
      },
    ],
    bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    bookingTime: '10:00',
    duration: 90,
    totalPrice: 140.00,
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    customerNotes: 'Please use lavender essential oil',
    assignedCompanyId: undefined,
    assignedUserId: undefined,
    assignedBy: undefined,
  },
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 1,
      },
    ],
    bookingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    bookingTime: '14:30',
    duration: 60,
    totalPrice: 120.00,
    status: BookingStatus.ASSIGNED_TO_COMPANY,
    paymentStatus: PaymentStatus.PAID,
    customerNotes: 'First time customer, please be gentle',
    assignedCompanyId: undefined, // Will be populated during seeding
    assignedUserId: undefined,
    assignedBy: undefined, // Will be populated during seeding
  },
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 2,
      },
    ],
    bookingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    bookingTime: '16:00',
    duration: 120,
    totalPrice: 200.00,
    status: BookingStatus.ASSIGNED_TO_MEMBER,
    paymentStatus: PaymentStatus.PAID,
    customerNotes: 'Anniversary celebration',
    assignedCompanyId: undefined, // Will be populated during seeding
    assignedUserId: undefined, // Will be populated during seeding
    assignedBy: undefined, // Will be populated during seeding
  },
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 1,
      },
    ],
    bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    bookingTime: '09:00',
    duration: 60,
    totalPrice: 95.00,
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    customerNotes: 'Regular customer, prefer room 2',
    assignedCompanyId: undefined,
    assignedUserId: undefined,
    assignedBy: undefined,
  },
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 1,
      },
    ],
    bookingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    bookingTime: '11:00',
    duration: 45,
    totalPrice: 90.00,
    status: BookingStatus.IN_PROGRESS,
    paymentStatus: PaymentStatus.PAID,
    customerNotes: 'Urgent appointment for back pain',
    assignedCompanyId: undefined,
    assignedUserId: undefined,
    assignedBy: undefined,
  },
  {
    services: [
      {
        serviceId: '', // Will be populated with actual service ID
        quantity: 1,
      },
    ],
    bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    bookingTime: '15:00',
    duration: 90,
    totalPrice: 150.00,
    status: BookingStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    customerNotes: 'Excellent service, will book again',
    assignedCompanyId: undefined,
    assignedUserId: undefined,
    assignedBy: undefined,
  },
];
