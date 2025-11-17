import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductWithDetails } from '../types/database';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const products = await productService.getFeaturedProducts();
        const filtered = products.filter((p: ProductWithDetails) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 6));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-lg outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/products`}
                  onClick={onClose}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                    {product.images[0] && (
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="text-sm font-light">
                    ₦{Math.min(...product.variants.map(v => v.price)).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-8 text-center text-gray-500">
              No products found for "{query}"
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
