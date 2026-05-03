import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';
import { apiRequest } from '../lib/api';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'cart';
const TOKEN_STORAGE_KEY = 'auth_token';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const parseJsonField = (value: any, fallback: any[] = []): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return fallback; }
    }
    return fallback;
  };

  const mapCartItems = (cartItems: any[]): CartItem[] =>
    cartItems
      .filter((entry) => entry.productId)
      .map((entry) => ({
        id: String(entry.productId._id ?? entry.productId.id),
        name: entry.productId.name,
        category: entry.productId.category,
        price: entry.productId.price,
        rating: entry.productId.rating ?? 4.5,
        stockSold: entry.productId.stockSold ?? 0,
        availableStock: entry.productId.availableStock ?? 0,
        images: parseJsonField(entry.productId.images),
        description: entry.productId.description ?? '',
        tags: parseJsonField(entry.productId.tags),
        season: entry.productId.season ?? undefined,
        isNewArrival: !!entry.productId.isNewArrival,
        isTrending: !!entry.productId.isTrending,
        isBudgetFriendly: !!entry.productId.isBudgetFriendly,
        isMostSearched: !!entry.productId.isMostSearched,
        quantity: entry.quantity,
      }));

  const syncServerCart = async (nextItems: CartItem[], activeToken: string) => {
    const payload = nextItems.map((item) => ({ productId: item.id, quantity: item.quantity }));
    const response = await apiRequest<{ cart: { items: any[] } }>('/cart', {
      method: 'PUT',
      token: activeToken,
      body: { items: payload },
    });
    setItems(mapCartItems(response.cart.items));
  };

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    setToken(savedToken);
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const refresh = async () => {
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (currentToken !== token) setToken(currentToken);
      if (!currentToken) return;

      try {
        // Merge guest cart into server cart once user authenticates.
        if (items.length > 0) {
          await syncServerCart(items, currentToken);
          return;
        }
        const response = await apiRequest<{ cart: { items: any[] } }>('/cart', {
          token: currentToken,
        });
        setItems(mapCartItems(response.cart.items));
      } catch {
        // Keep local cart on transient failure.
      }
    };

    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find(item => item.id === product.id);
      const next = existing
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, item.availableStock) }
              : item,
          )
        : [...prev, { ...product, quantity }];

      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (currentToken) {
        syncServerCart(next, currentToken).catch(() => undefined);
      }
      return next;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const next = prev.filter(item => item.id !== productId);
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (currentToken) {
        syncServerCart(next, currentToken).catch(() => undefined);
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(quantity, item.availableStock) } : item,
      );
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (currentToken) {
        syncServerCart(next, currentToken).catch(() => undefined);
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (currentToken) {
      apiRequest<void>('/cart', { method: 'DELETE', token: currentToken }).catch(() => undefined);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
