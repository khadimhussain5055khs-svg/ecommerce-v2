import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';

export function ProductListingPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { products, loading, error } = useCatalog();
  const filter = searchParams.get('filter');
  const search = searchParams.get('search');

  let filteredProducts = products;

  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (filter) {
    switch (filter) {
      case 'new':
        filteredProducts = filteredProducts.filter(p => p.isNewArrival);
        break;
      case 'trending':
        filteredProducts = filteredProducts.filter(p => p.isTrending);
        break;
      case 'budget':
        filteredProducts = filteredProducts.filter(p => p.isBudgetFriendly);
        break;
      case 'searched':
        filteredProducts = filteredProducts.filter(p => p.isMostSearched);
        break;
      case 'spring':
      case 'summer':
      case 'fall':
      case 'winter':
        filteredProducts = filteredProducts.filter(p => p.season === filter);
        break;
    }
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const getTitle = () => {
    if (search) return `Search Results for "${search}"`;
    if (filter === 'new') return 'New Arrivals';
    if (filter === 'trending') return 'Trending Products';
    if (filter === 'budget') return 'Budget Friendly';
    if (filter === 'searched') return 'Most Searched';
    if (filter && ['spring', 'summer', 'fall', 'winter'].includes(filter)) {
      return `${filter.charAt(0).toUpperCase() + filter.slice(1)} Collection`;
    }
    if (category === 'shoes') return 'Shoes';
    if (category === 'shirts') return 'Shirts';
    return 'All Products';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Unable to load products</h2>
          <p className="text-gray-400 mb-6">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{getTitle()}</h1>
        <p className="text-gray-600">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-2xl font-bold text-gray-700 mb-2">No products found</p>
          <p className="text-gray-400 mt-2">
            {search ? `No results for "${search}" — try different keywords.` : 'Check back soon or browse another category.'}
          </p>
          <Link to="/" className="inline-block mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
