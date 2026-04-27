import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';

const defaultCategories = [
  { name: 'Shoes', slug: 'shoes', description: 'All kinds of shoes' },
  { name: 'Shirts', slug: 'shirts', description: 'Casual and formal shirts' },
];

const defaultProducts = [
  {
    name: 'Air Max Performance Sneakers',
    category: 'shoes',
    price: 129.99,
    rating: 4.8,
    stockSold: 1250,
    availableStock: 45,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    description: 'Premium performance sneakers with air cushioning technology',
    tags: ['running', 'sports', 'casual'],
    season: 'spring',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'Classic White Dress Shirt',
    category: 'shirts',
    price: 59.99,
    rating: 4.5,
    stockSold: 1450,
    availableStock: 120,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'],
    description: 'Premium cotton dress shirt perfect for formal occasions',
    tags: ['formal', 'cotton', 'classic'],
    isMostSearched: true,
  },
];

const defaultBanners = [
  {
    title: 'Summer Sale - Up to 50% Off',
    subtitle: 'Limited Time Offer',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
    cta: 'Shop Now',
  },
];

export async function bootstrapData() {
  const ownerEmail = env.OWNER_EMAIL.toLowerCase();
  const owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    const passwordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);
    await User.create({
      name: env.OWNER_NAME,
      email: ownerEmail,
      passwordHash,
      role: 'owner',
    });
    console.log('Owner user bootstrapped');
  }

  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(defaultCategories);
    console.log('Default categories bootstrapped');
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(defaultProducts);
    console.log('Default products bootstrapped');
  }

  if ((await Banner.countDocuments()) === 0) {
    await Banner.insertMany(defaultBanners);
    console.log('Default banners bootstrapped');
  }
}
