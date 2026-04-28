import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { BrandLogo } from './BrandLogo';
import { useCatalog } from '../context/CatalogContext';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { sections, siteSettings } = useCatalog();
  const navigate = useNavigate();
  const headerSections = sections
    .filter((section) => section.isActive && section.showInHeader)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/all?search=${searchQuery}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="bg-gradient-to-r from-black via-zinc-900 to-black text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              {siteSettings.headerDealsImage ? (
                <img
                  src={siteSettings.headerDealsImage}
                  alt="Deals"
                  className="h-7 w-12 rounded-md object-cover ring-1 ring-white/10"
                />
              ) : (
                <span className="inline-flex h-7 w-12 items-center justify-center rounded-md bg-white/10 text-xs font-semibold">
                  DEAL
                </span>
              )}
              <span className="font-medium tracking-wide">{siteSettings.headerDealsText}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden items-center gap-2 text-white/90 sm:flex">
                    <User className="h-4 w-4" />
                    <span className="max-w-[180px] truncate">{user?.name}</span>
                  </span>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="rounded-md px-2 py-1 font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/my-orders"
                    className="rounded-md px-2 py-1 font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-md px-2 py-1 font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="rounded-md px-2 py-1 font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-sm hover:bg-gray-50 md:hidden"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <BrandLogo />
            </div>

            <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
              <div className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, tags, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm shadow-sm outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Link
                to="/cart"
                className="relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-sm hover:bg-gray-50"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm shadow-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
            <ul className="mt-4 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm md:mt-3 md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              {[
                { label: 'Shoes', to: '/products/shoes' },
                { label: 'Shirts', to: '/products/shirts' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative block rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 md:hover:bg-transparent md:px-2 md:py-1.5"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all group-hover:w-full md:block" />
                    </span>
                  </Link>
                </li>
              ))}

              {headerSections.map((section) => (
                <li key={section.id}>
                  <Link
                    to={`/sections/${section.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 md:hover:bg-transparent md:px-2 md:py-1.5"
                  >
                    <span className="relative">
                      {section.name}
                      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all group-hover:w-full md:block" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
