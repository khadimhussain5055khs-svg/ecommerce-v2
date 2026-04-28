import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatPKR } from '../lib/currency';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { products } = useCatalog();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please login to continue with purchase');
      return;
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <ImageWithFallback
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-red-600' : 'border-transparent'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg">({product.rating})</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">{product.stockSold} sold</span>
          </div>

          <div className="mb-6">
            <p className="text-5xl font-bold text-red-600">{formatPKR(product.price)}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Available Stock:</span>
              <span className={product.availableStock < 20 ? 'text-red-600 font-semibold' : ''}>
                {product.availableStock} units
              </span>
            </div>
          </div>

          <div className="mb-6">
            <span className="font-semibold mb-2 block">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <span className="font-semibold mb-2 block">Quantity:</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
