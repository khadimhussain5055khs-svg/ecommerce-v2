import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatPKR } from '../lib/currency';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.rating})</span>
          </div>

          <div className="mb-2">
            <p className="text-2xl font-bold text-red-600">{formatPKR(product.price)}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Sold: {product.stockSold}</span>
            <span className={product.availableStock < 20 ? 'text-red-600' : ''}>
              Stock: {product.availableStock}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
