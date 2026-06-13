/**
 * Product Card Component
 * Reusable card displaying product information with optional return action.
 */

import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  actionLabel?: string;
}

export default function ProductCard({ product, onSelect, actionLabel = 'Return Item' }: ProductCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
          <p className="text-sm text-gray-500">Order: {product.order_id}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-lg">${product.original_price.toFixed(2)}</span>
            {product.return_eligible && onSelect && (
              <button
                onClick={() => onSelect(product)}
                className="btn-primary text-sm py-1.5 px-4"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
