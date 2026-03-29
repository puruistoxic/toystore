import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, ShoppingCart } from 'lucide-react';
import type { Product } from '../types/catalog';
import { useCart } from '../contexts/CartContext';
import { useAddToListModal } from '../contexts/AddToListModalContext';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  showBestSellerBadge?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails,
  showBestSellerBadge = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { openAddToList } = useAddToListModal();
  const inList = useMemo(
    () => items.some((l) => l.productId === String(product.id)),
    [items, product.id],
  );
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : getPlaceholderImage(400, 300, product.name);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails(product);
      return;
    }
    navigate(`/products/${product.slug}`);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddToList(product);
  };

  return (
    <div
      className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => handleImageError(e, product.name)}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-primary-600 font-semibold text-sm">View Details</span>
          </div>
        </div>
        {/* Best Seller Badge */}
        {showBestSellerBadge && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Best Seller
          </div>
        )}
        {/* Stock Badge */}
        {product.inStock && product.stockQuantity > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            In Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand & Rating */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</span>
          {product.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="ml-1 text-xs text-gray-600 font-medium">{product.rating}</span>
            </div>
          )}
        </div>
        
        {/* Product Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Short Description */}
        {product.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[2rem]">
            {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
          </p>
        )}
        
        {/* Age Group & Occasion Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.ageGroup && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
              {product.ageGroup}
            </span>
          )}
          {product.occasion && product.occasion.length > 0 && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
              {product.occasion[0]}
            </span>
          )}
        </div>

        {/* Price */}
        {product.price > 0 && (
          <div className="mb-3">
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-primary-600">₹{product.price.toLocaleString('en-IN')}</span>
              {product.priceIncludesGst && (
                <span className="ml-2 text-xs text-gray-500">(GST Inc.)</span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {onViewDetails ? (
            <button
              type="button"
              onClick={handleViewDetailsClick}
              className="w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg text-sm"
            >
              <Eye className="h-4 w-4 mr-2" aria-hidden />
              View Details
            </button>
          ) : (
            <Link
              to={`/products/${product.slug}`}
              onClick={handleViewDetailsClick}
              className="block w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          )}
          <button
            type="button"
            onClick={handleAddToList}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold border-2 transition-colors text-sm shadow-sm ${
              inList
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50'
            }`}
            aria-label={inList ? 'Product is in your order list. Click to add another.' : 'Add to order list'}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
            {inList ? 'In your list' : 'Add to list'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
