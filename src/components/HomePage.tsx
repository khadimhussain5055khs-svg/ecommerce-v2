import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HomePage() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { products, advertisements } = useCatalog();

  useEffect(() => {
    if (advertisements.length === 0) return;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [advertisements.length]);

  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const mostSearchedProducts = products.filter(p => p.isMostSearched).slice(0, 4);
  const budgetFriendlyProducts = products.filter(p => p.isBudgetFriendly).slice(0, 4);

  const nextAd = () => {
    if (advertisements.length === 0) return;
    setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevAd = () => {
    if (advertisements.length === 0) return;
    setCurrentAdIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative h-96 rounded-xl overflow-hidden mb-12 group">
        {advertisements.length > 0 ? (
          <>
            {advertisements.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentAdIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ImageWithFallback
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white">
                  <h2 className="text-5xl font-bold mb-4">{ad.title}</h2>
                  <p className="text-2xl mb-6">{ad.subtitle}</p>
                  <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    {ad.cta}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={prevAd}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextAd}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {advertisements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAdIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentAdIndex ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
            No advertisements configured
          </div>
        )}
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Most Trendy Articles</h2>
          <span className="text-red-600 font-semibold">View All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Most Searched Articles</h2>
          <span className="text-red-600 font-semibold">View All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mostSearchedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Budget Friendly Articles</h2>
          <span className="text-red-600 font-semibold">View All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetFriendlyProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
