import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  advertisements as defaultAdvertisements,
  defaultSections,
  defaultSiteSettings,
  products as defaultProducts,
  type Advertisement,
  type Product,
  type Section,
  type SiteSettings,
} from '../data/products';
import { apiRequest } from '../lib/api';

interface CatalogContextType {
  products: Product[];
  advertisements: Advertisement[];
  sections: Section[];
  siteSettings: SiteSettings;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, changes: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addAdvertisement: (advertisement: Omit<Advertisement, 'id'>) => Promise<void>;
  updateAdvertisement: (advertisementId: string, changes: Partial<Advertisement>) => Promise<void>;
  deleteAdvertisement: (advertisementId: string) => Promise<void>;
  addSection: (section: Omit<Section, 'id'>) => Promise<void>;
  updateSection: (sectionId: string, changes: Partial<Section>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  updateSiteSettings: (changes: Partial<SiteSettings>) => Promise<void>;
  refreshCatalog: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'auth_token';
const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

  const toProduct = (product: any): Product => ({
    id: String(product._id ?? product.id),
    name: product.name,
    category: product.category,
    price: product.price,
    rating: product.rating ?? 4.5,
    stockSold: product.stockSold ?? 0,
    availableStock: product.availableStock ?? 0,
    images: product.images ?? [],
    description: product.description ?? '',
    tags: product.tags ?? [],
    season: product.season ?? undefined,
    isNewArrival: !!product.isNewArrival,
    isTrending: !!product.isTrending,
    isBudgetFriendly: !!product.isBudgetFriendly,
    isMostSearched: !!product.isMostSearched,
  });

  const toAdvertisement = (ad: any): Advertisement => ({
    id: String(ad._id ?? ad.id),
    title: ad.title,
    subtitle: ad.subtitle ?? '',
    image: ad.image,
    cta: ad.cta ?? 'Shop Now',
  });

  const toSection = (section: any): Section => ({
    id: String(section._id ?? section.id),
    name: section.name,
    slug: section.slug,
    description: section.description ?? '',
    image: section.image ?? '',
    showInHeader: !!section.showInHeader,
    showInHomepage: !!section.showInHomepage,
    isActive: section.isActive !== false,
    sortOrder: section.sortOrder ?? 0,
    productIds: (section.productIds ?? []).map(toProduct),
  });

  const toSiteSettings = (settings: any): SiteSettings => ({
    headerDealsImage: settings?.headerDealsImage ?? '',
    headerDealsText: settings?.headerDealsText ?? defaultSiteSettings.headerDealsText,
    footerText: settings?.footerText ?? defaultSiteSettings.footerText,
    footerLinks: settings?.footerLinks?.length ? settings.footerLinks : defaultSiteSettings.footerLinks,
  });

  const refreshCatalog = async () => {
    setLoading(true);
    try {
      const [productsResponse, bannersResponse, sectionsResponse, settingsResponse] = await Promise.all([
        apiRequest<{ products: any[] }>('/catalog/products'),
        apiRequest<{ banners: any[] }>('/catalog/banners'),
        apiRequest<{ sections: any[] }>('/catalog/sections'),
        apiRequest<{ settings: any }>('/catalog/site-settings'),
      ]);
      const mappedProducts = productsResponse.products.map(toProduct);
      const mappedBanners = bannersResponse.banners.map(toAdvertisement);
      const mappedSections = sectionsResponse.sections.map(toSection);
      setProducts(mappedProducts);
      setAdvertisements(mappedBanners);
      setSections(mappedSections);
      setSiteSettings(toSiteSettings(settingsResponse.settings));
    } catch {
      setProducts([]);
      setAdvertisements([]);
      setSections([]);
      setSiteSettings(defaultSiteSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const token = getToken();
    const response = await apiRequest<{ product: any }>('/catalog/products', {
      method: 'POST',
      token,
      body: { ...product, season: product.season ?? null },
    });
    setProducts((previous) => [toProduct(response.product), ...previous]);
    await refreshCatalog();
  };

  const updateProduct = async (productId: string, changes: Partial<Product>) => {
    const token = getToken();
    const response = await apiRequest<{ product: any }>(`/catalog/products/${productId}`, {
      method: 'PATCH',
      token,
      body: { ...changes, season: changes.season ?? null },
    });
    const next = toProduct(response.product);
    setProducts((previous) =>
      previous.map((product) => (product.id === productId ? next : product)),
    );
  };

  const deleteProduct = async (productId: string) => {
    const token = getToken();
    await apiRequest<void>(`/catalog/products/${productId}`, { method: 'DELETE', token });
    setProducts((previous) => previous.filter((product) => product.id !== productId));
  };

  const addAdvertisement = async (advertisement: Omit<Advertisement, 'id'>) => {
    const token = getToken();
    const response = await apiRequest<{ banner: any }>('/catalog/banners', {
      method: 'POST',
      token,
      body: advertisement,
    });
    setAdvertisements((previous) => [toAdvertisement(response.banner), ...previous]);
  };

  const updateAdvertisement = async (advertisementId: string, changes: Partial<Advertisement>) => {
    const token = getToken();
    const response = await apiRequest<{ banner: any }>(`/catalog/banners/${advertisementId}`, {
      method: 'PATCH',
      token,
      body: changes,
    });
    const next = toAdvertisement(response.banner);
    setAdvertisements((previous) =>
      previous.map((ad) => (ad.id === advertisementId ? next : ad)),
    );
  };

  const deleteAdvertisement = async (advertisementId: string) => {
    const token = getToken();
    await apiRequest<void>(`/catalog/banners/${advertisementId}`, { method: 'DELETE', token });
    setAdvertisements((previous) => previous.filter((ad) => ad.id !== advertisementId));
  };

  const addSection = async (section: Omit<Section, 'id'>) => {
    const token = getToken();
    const response = await apiRequest<{ section: any }>('/catalog/sections', {
      method: 'POST',
      token,
      body: {
        ...section,
        productIds: section.productIds.map((product) => product.id),
      },
    });
    setSections((previous) => [toSection(response.section), ...previous]);
  };

  const updateSection = async (sectionId: string, changes: Partial<Section>) => {
    const token = getToken();
    const response = await apiRequest<{ section: any }>(`/catalog/sections/${sectionId}`, {
      method: 'PATCH',
      token,
      body: {
        ...changes,
        productIds: changes.productIds?.map((product) => product.id),
      },
    });
    const next = toSection(response.section);
    setSections((previous) => previous.map((section) => (section.id === sectionId ? next : section)));
  };

  const deleteSection = async (sectionId: string) => {
    const token = getToken();
    await apiRequest<void>(`/catalog/sections/${sectionId}`, { method: 'DELETE', token });
    setSections((previous) => previous.filter((section) => section.id !== sectionId));
  };

  const updateSiteSettings = async (changes: Partial<SiteSettings>) => {
    const token = getToken();
    const response = await apiRequest<{ settings: any }>('/catalog/site-settings', {
      method: 'PATCH',
      token,
      body: changes,
    });
    setSiteSettings(toSiteSettings(response.settings));
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        advertisements,
        sections,
        siteSettings,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addAdvertisement,
        updateAdvertisement,
        deleteAdvertisement,
        addSection,
        updateSection,
        deleteSection,
        updateSiteSettings,
        refreshCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider');
  }
  return context;
}
