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
