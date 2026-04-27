import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-200 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/products/shoes" onClick={onClose} className="block rounded-md px-3 py-2 hover:bg-gray-100">
                Shoes
              </Link>
            </li>
            <li>
              <Link to="/products/shirts" onClick={onClose} className="block rounded-md px-3 py-2 hover:bg-gray-100">
                Shirts
              </Link>
            </li>
            <li>
              <Link to="/products/all?filter=season" onClick={onClose} className="block rounded-md px-3 py-2 hover:bg-gray-100">
                Seasonal
              </Link>
            </li>
            <li>
              <Link to="/products/all?filter=new" onClick={onClose} className="block rounded-md px-3 py-2 hover:bg-gray-100">
                New Arrivals
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
