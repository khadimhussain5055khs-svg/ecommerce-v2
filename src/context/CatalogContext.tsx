import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { advertisements as defaultAdvertisements, products as defaultProducts, type Advertisement, type Product } from '../data/products';
import { apiRequest } from '../lib/api';

interface CatalogContextType {
  products: Product[];
  advertisements: Advertisement[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, changes: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addAdvertisement: (advertisement: Omit<Advertisement, 'id'>) => Promise<void>;
  updateAdvertisement: (advertisementId: string, changes: Partial<Advertisement>) => Promise<void>;
  deleteAdvertisement: (advertisementId: string) => Promise<void>;
  refreshCatalog: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'auth_token';
const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(defaultAdvertisements);
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

  const refreshCatalog = async () => {
    setLoading(true);
    try {
      const [productsResponse, bannersResponse] = await Promise.all([
        apiRequest<{ products: any[] }>('/catalog/products'),
        apiRequest<{ banners: any[] }>('/catalog/banners'),
      ]);
      const mappedProducts = productsResponse.products.map(toProduct);
      const mappedBanners = bannersResponse.banners.map(toAdvertisement);
      setProducts(mappedProducts.length > 0 ? mappedProducts : defaultProducts);
      setAdvertisements(mappedBanners.length > 0 ? mappedBanners : defaultAdvertisements);
    } catch {
      setProducts(defaultProducts);
      setAdvertisements(defaultAdvertisements);
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

  return (
    <CatalogContext.Provider
      value={{
        products,
        advertisements,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addAdvertisement,
        updateAdvertisement,
        deleteAdvertisement,
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
