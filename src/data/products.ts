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
  {
    id: 'shoe-7',
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
    id: 'shoe-8',
    name: 'Nike Air Zoom Pegasus Runner',
    category: 'shoes',
    price: 6000,
    rating: 4.7,
    stockSold: 0,
    availableStock: 1,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    description: 'Nike Air Zoom Pegasus Runner in Euro 40.5-41 (Pakistani 7.5-8). Lightweight runner with responsive cushioning and a sleek black and white profile.',
    tags: ['Nike', 'Air Zoom Pegasus', 'sneakers', 'Euro 40.5-41', 'Pakistani 7.5-8'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: 'shoe-9',
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
    id: 'shoe-10',
    name: 'Adidas Yeezy 350 Black Reflective',
    category: 'shoes',
    price: 3000,
    rating: 4.8,
    stockSold: 0,
    availableStock: 1,
    images: ['https://drive.google.com/file/d/1wNnVEwihpTVTSygo-vx0MxdxXf15eHkj/view?usp=drive_link'],
    description: 'Adidas Yeezy 350 Black Reflective in Euro 40/41 (Pakistani 7/8). Sleek black reflective runner with premium knit upper and cushioning.',
    tags: ['Adidas', 'Yeezy', '350', 'Reflective', 'Euro 40/41', 'Pakistani 7/8'],
    season: 'summer',
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: 'shoe-11',
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
    id: 'shoe-12',
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
    'Premium sneaker drops only — curated collection of the best shoes in stock.',
  footerLinks: [
    { label: 'Blog', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'FAQs', href: '#' },
  ],
};
