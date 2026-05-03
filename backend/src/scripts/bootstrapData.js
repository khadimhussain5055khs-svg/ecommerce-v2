import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const defaultCategories = [
  { name: 'Shoes', slug: 'shoes', description: 'All kinds of shoes' },
];

const defaultProducts = [
  {
    name: 'Jordan 1 Mid Chicago',
    category: 'shoes',
    price: 4499,
    rating: 4.9,
    stockSold: 0,
    availableStock: 40,
    images: ['https://drive.google.com/file/d/1wNnVEwihpTVTSygo-vx0MxdxXf15eHkj/view?usp=drive_link'],
    description: 'Jordan 1 Mid Chicago in Euro 44-45 (Pakistani 10/11). Limited stock drop with the classic red, white, and black leather colorway.',
    tags: ['Jordan', 'Chicago', 'sneakers', 'Euro 44-45', 'Pakistani 10/11'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'Nike Air Zoom Pegasus Runner',
    category: 'shoes',
    price: 6000,
    rating: 4.7,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1595950657420-44f5f7cb1440?w=800&q=80'],
    description: 'Nike Air Zoom Pegasus Runner in Euro 40.5-41 (Pakistani 7.5-8). Lightweight runner with responsive cushioning and a sleek black and white profile.',
    tags: ['Nike', 'Air Zoom Pegasus', 'sneakers', 'Euro 40.5-41', 'Pakistani 7.5-8'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'Adidas SuperStar White & Black',
    category: 'shoes',
    price: 4000,
    rating: 4.8,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1528701800489-20b8a54059b1?w=800&q=80'],
    description: 'Adidas SuperStar White & Black in Euro 42-43 (Pakistani 8/9). Classic leather sneaker with signature shell toe and bold black stripes.',
    tags: ['Adidas', 'SuperStar', 'sneakers', 'Euro 42-43', 'Pakistani 8/9'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'Adidas Yeezy 350 Black Reflective',
    category: 'shoes',
    price: 3000,
    rating: 4.8,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'],
    description: 'Adidas Yeezy 350 Black Reflective in Euro 40/41 (Pakistani 7/8). Sleek black reflective runner with premium knit upper and cushioning.',
    tags: ['Adidas', 'Yeezy', '350', 'Reflective', 'Euro 40/41', 'Pakistani 7/8'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'New Balance Classic 574',
    category: 'shoes',
    price: 3500,
    rating: 4.6,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80'],
    description: 'New Balance Classic 574 in Euro 41.5-42 (Pakistani 8-8.5). Timeless suede and mesh trainer with cushioned comfort and retro styling.',
    tags: ['New Balance', '574', 'classic', 'Euro 41.5-42', 'Pakistani 8-8.5'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    name: 'Travis Scott x SB Dunks',
    category: 'shoes',
    price: 2500,
    rating: 4.7,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1516684669134-de6b2f3d140d?w=800&q=80'],
    description: 'Travis Scott x SB Dunks in Euro 41-42 (Pakistani 8-8.5). Premium collaboration with unique paisley patterns and earthy tones.',
    tags: ['Nike', 'SB Dunks', 'Travis Scott', 'Euro 41-42', 'Pakistani 8-8.5'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
];

const defaultBanners = [
  {
    title: 'Premium Curated Sneakers',
    subtitle: 'Only the latest drops available',
    image: 'https://images.unsplash.com/photo-1528701800489-20b8a54059b1?w=1200&q=80',
    cta: 'Browse Now',
  },
];

export async function bootstrapData() {
  const ownerEmail = env.OWNER_EMAIL.toLowerCase();
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) {
    const passwordHash = await bcrypt.hash(env.OWNER_PASSWORD, 10);
    await prisma.user.create({ data: { name: env.OWNER_NAME, email: ownerEmail, passwordHash, role: 'owner' } });
    console.log('Owner user bootstrapped');
  }

  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({ data: defaultCategories });
    console.log('Default categories bootstrapped');
  }

  if ((await prisma.product.count()) === 0 && defaultProducts.length > 0) {
    await prisma.product.createMany({
      data: defaultProducts.map((item) => ({ ...item, images: item.images, tags: item.tags })),
    });
    console.log('Default products bootstrapped');
  }

  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({ data: defaultBanners });
    console.log('Default banners bootstrapped');
  }
}
