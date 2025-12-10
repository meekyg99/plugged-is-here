import { useState, useEffect, useMemo } from 'react';
import { X, Search, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
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
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setActiveIndex(-1);
        return;
      }

      setLoading(true);
      try {
        const products = await productService.searchProducts(query.trim());
        setResults(products.slice(0, 8));
        setActiveIndex(products.length > 0 ? 0 : -1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        // Let Link handle navigation via click simulation
        const target = document.getElementById(`search-result-${results[activeIndex].id}`);
        if (target) {
          target.click();
        }
      }
    }
  };

  const highlight = useMemo(() => {
    const lower = query.toLowerCase();
    return (text: string) => {
      const idx = text.toLowerCase().indexOf(lower);
      if (idx === -1) return text;
      return (
        <>
          {text.slice(0, idx)}
          <mark className="bg-yellow-100 text-gray-900">{text.slice(idx, idx + lower.length)}</mark>
          {text.slice(idx + lower.length)}
        </>
      );
    };
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
              onKeyDown={handleKeyDown}
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
                  id={`search-result-${product.id}`}
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center p-4 transition-colors ${
                    activeIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
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
                    <h3 className="text-sm font-medium">{highlight(product.name)}</h3>
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

        <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><ArrowDown className="w-3 h-3" /> / <ArrowUp className="w-3 h-3" /> to navigate</span>
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> to select</span>
          </div>
          <span>Showing {results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
