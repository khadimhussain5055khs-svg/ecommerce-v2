import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/all?search=${searchQuery}`);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="bg-black text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-end items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name}
                </span>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-red-500 transition-colors">
                    Admin
                  </Link>
                )}
                <Link to="/my-orders" className="hover:text-red-500 transition-colors">
                  My Orders
                </Link>
                <button onClick={logout} className="hover:text-red-500 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-red-500 transition-colors">
                  Login
                </button>
                <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-red-500 transition-colors">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            <BrandLogo />

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 bg-red-600 text-white px-6 rounded-r-lg hover:bg-red-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative hover:text-red-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block mt-4`}>
            <ul className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <li>
                <Link to="/products/shoes" className="text-black hover:text-red-600 transition-colors font-medium">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/products/shirts" className="text-black hover:text-red-600 transition-colors font-medium">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/products/all?filter=season" className="text-black hover:text-blue-600 transition-colors">
                  Seasonal
                </Link>
              </li>
              <li>
                <Link to="/products/all?filter=new" className="text-black hover:text-blue-600 transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
