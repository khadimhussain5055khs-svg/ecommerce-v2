import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SectionPage() {
  const { slug } = useParams();
  const { sections } = useCatalog();
  const section = sections.find((item) => item.slug === slug);

  if (!section) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-3 text-3xl font-bold">Section not found</h1>
        <Link to="/" className="text-red-600 hover:text-red-700">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {section.image && (
        <div className="mb-8 h-72 overflow-hidden rounded-xl">
          <ImageWithFallback src={section.image} alt={section.name} className="h-full w-full object-cover" />
        </div>
      )}
      <h1 className="text-4xl font-bold">{section.name}</h1>
      {section.description && <p className="mt-2 text-gray-600">{section.description}</p>}

      <div className="mt-8">
        {section.productIds.length === 0 ? (
          <p className="text-gray-500">No products assigned to this section yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {section.productIds.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
