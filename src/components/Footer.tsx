import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useCatalog } from '../context/CatalogContext';

export function Footer() {
  const { sections, siteSettings } = useCatalog();
  const footerSections = sections
    .filter((section) => section.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <BrandLogo compact />
            </div>
            <p className="text-gray-400 text-sm">
              {siteSettings.footerText}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products/shoes" className="text-gray-400 hover:text-red-500 transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/products/shirts" className="text-gray-400 hover:text-red-500 transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/products/all?filter=trending" className="text-gray-400 hover:text-red-500 transition-colors">
                  Trending
                </Link>
              </li>
              {footerSections.map((section) => (
                <li key={section.id}>
                  <Link to={`/sections/${section.slug}`} className="text-gray-400 hover:text-red-500 transition-colors">
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {siteSettings.footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-red-500 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2026 PreLounge. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
