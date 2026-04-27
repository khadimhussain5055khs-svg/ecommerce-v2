import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CatalogProvider } from '../context/CatalogContext';

export function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed left-4 top-20 z-30 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Header />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1">
              <Outlet />
            </main>

            <Footer />
          </div>
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
