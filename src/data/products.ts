import shoe1 from './assets/shoe1.jpg';

export interface Product {
  id: string;
  name: string;
  category: 'shoes' | 'shirts';
  price: number;
  rating: number;
  stockSold: number;
  availableStock: number;
  images: string[];
  description: string;
  tags: string[];
  season?: string;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isBudgetFriendly?: boolean;
  isMostSearched?: boolean;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

export interface Section {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  showInHeader: boolean;
  showInHomepage: boolean;
  isActive: boolean;
  sortOrder: number;
  productIds: Product[];
}

export interface SiteSettings {
  headerDealsImage: string;
  headerDealsText: string;
  footerText: string;
  footerLinks: { label: string; href: string }[];
}

export const products: Product[] = [
  // Shoes
  {
    id: 'shoe-1',
    name: 'Air Max Performance Sneakers',
    category: 'shoes',
    price: 129.99,
    rating: 4.8,
    stockSold: 1250,
    availableStock: 45,
    images:   ['https://collection.cloudinary.com/dmj67cfbr/c5ca0975b9017d6892601b26c883ccccw=800&q=80'],
    description: 'Premium performance sneakers with air cushioning technology',
    tags: ['running', 'sports', 'casual'],
    season: 'spring',
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: 'shoe-2',
    name: 'Classic Leather Boots',
    category: 'shoes',
    price: 189.99,
    rating: 4.6,
    stockSold: 890,
    availableStock: 28,
    images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80'],
    description: 'Handcrafted leather boots for all-day comfort',
    tags: ['formal', 'winter', 'leather'],
    season: 'winter',
    isMostSearched: true,
  },
  {
    id: 'shoe-3',
    name: 'Budget Canvas Sneakers',
    category: 'shoes',
    price: 39.99,
    rating: 4.3,
    stockSold: 2100,
    availableStock: 150,
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'],
    description: 'Affordable and stylish canvas sneakers',
    tags: ['casual', 'budget', 'everyday'],
    isBudgetFriendly: true,
    isMostSearched: true,
  },
  {
    id: 'shoe-4',
    name: 'Running Pro Elite',
    category: 'shoes',
    price: 159.99,
    rating: 4.9,
    stockSold: 1580,
    availableStock: 62,
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'],
    description: 'Professional running shoes with advanced cushioning',
    tags: ['running', 'sports', 'professional'],
    season: 'summer',
    isTrending: true,
  },
  {
    id: 'shoe-5',
    name: 'Casual Slip-On Loafers',
    category: 'shoes',
    price: 79.99,
    rating: 4.4,
    stockSold: 720,
    availableStock: 95,
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80'],
    description: 'Comfortable slip-on loafers for everyday wear',
    tags: ['casual', 'comfort', 'loafers'],
    isBudgetFriendly: true,
  },
  {
    id: 'shoe-6',
    name: 'High-Top Basketball Shoes',
    category: 'shoes',
    price: 149.99,
    rating: 4.7,
    stockSold: 980,
    availableStock: 38,
    images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80'],
    description: 'Professional basketball shoes with ankle support',
    tags: ['basketball', 'sports', 'high-top'],
    isNewArrival: true,
    isTrending: true,
  },

  // Shirts
  {
    id: 'shirt-1',
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
  {
    id: 'shirt-2',
    name: 'Casual Denim Shirt',
    category: 'shirts',
    price: 49.99,
    rating: 4.6,
    stockSold: 1820,
    availableStock: 85,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
    description: 'Stylish denim shirt for casual outings',
    tags: ['casual', 'denim', 'trendy'],
    season: 'fall',
    isTrending: true,
  },
  {
    id: 'shirt-3',
    name: 'Budget Cotton T-Shirt Pack',
    category: 'shirts',
    price: 24.99,
    rating: 4.4,
    stockSold: 3200,
    availableStock: 250,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    description: 'Comfortable cotton t-shirts - pack of 3',
    tags: ['casual', 'budget', 'everyday'],
    isBudgetFriendly: true,
    isMostSearched: true,
  },
  {
    id: 'shirt-4',
    name: 'Premium Polo Shirt',
    category: 'shirts',
    price: 79.99,
    rating: 4.8,
    stockSold: 950,
    availableStock: 68,
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80'],
    description: 'Luxury polo shirt with moisture-wicking fabric',
    tags: ['polo', 'premium', 'sports'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: 'shirt-5',
    name: 'Flannel Plaid Shirt',
    category: 'shirts',
    price: 54.99,
    rating: 4.7,
    stockSold: 1100,
    availableStock: 92,
    images: ['https://images.unsplash.com/photo-1598032895397-b9073d2a1e95?w=800&q=80'],
    description: 'Warm flannel shirt perfect for cooler weather',
    tags: ['casual', 'flannel', 'winter'],
    season: 'winter',
  },
  {
    id: 'shirt-6',
    name: 'Graphic Print T-Shirt',
    category: 'shirts',
    price: 34.99,
    rating: 4.5,
    stockSold: 1680,
    availableStock: 145,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
    description: 'Trendy graphic print t-shirt with modern design',
    tags: ['casual', 'graphic', 'trendy'],
    isNewArrival: true,
    isBudgetFriendly: true,
  },
  {
    id: 'shirt-7',
    name: 'Linen Summer Shirt',
    category: 'shirts',
    price: 69.99,
    rating: 4.6,
    stockSold: 780,
    availableStock: 55,
    images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80'],
    description: 'Breathable linen shirt for hot summer days',
    tags: ['linen', 'summer', 'breathable'],
    season: 'summer',
    isTrending: true,
  },
  {
    id: 'shirt-8',
    name: 'Oxford Button-Down',
    category: 'shirts',
    price: 64.99,
    rating: 4.7,
    stockSold: 1250,
    availableStock: 78,
    images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80'],
    description: 'Classic Oxford button-down for smart casual look',
    tags: ['formal', 'oxford', 'versatile'],
    isMostSearched: true,
  },
];

export const advertisements: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Summer Sale - Up to 50% Off',
    subtitle: 'Limited Time Offer',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
    cta: 'Shop Now',
  },
  {
    id: 'ad-2',
    title: 'New Arrivals Are Here',
    subtitle: 'Discover the Latest Trends',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    cta: 'Explore Collection',
  },
  {
    id: 'ad-3',
    title: 'Premium Quality Guaranteed',
    subtitle: 'Shop with Confidence',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    cta: 'Learn More',
  },
];

export const defaultSections: Section[] = [];

export const defaultSiteSettings: SiteSettings = {
  headerDealsImage: '',
  headerDealsText: 'Hot deals live now',
  footerText:
    'Your one-stop destination for premium shoes and shirts. Quality products at unbeatable prices.',
  footerLinks: [
    { label: 'Blog', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'FAQs', href: '#' },
  ],
};
