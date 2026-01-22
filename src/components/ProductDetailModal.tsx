import React, { useState } from 'react';
import { X, MessageCircle, Star, CheckCircle, Package, Truck, Shield } from 'lucide-react';
import type { Product } from '../types/catalog';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '919898524462';

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !product) return null;

  const handleWhatsAppEnquiry = () => {
    const message = encodeURIComponent(
      `Hello Khandelwal Toy Store Team,\n\nI'm interested in:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nProduct Link: ${window.location.origin}/products/${product.slug}\n\nPlease provide:\n- Wholesale pricing for ${quantity} units\n- Minimum order quantity\n- Available stock\n- Delivery options\n- Bulk discount (if applicable)\n\nThank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const incrementQuantity = () => {
    if (product.minimumOrderQuantity) {
      setQuantity(prev => prev + product.minimumOrderQuantity!);
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (product.minimumOrderQuantity) {
      setQuantity(prev => Math.max(product.minimumOrderQuantity!, prev - product.minimumOrderQuantity!));
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : getPlaceholderImage(600, 400, product.name);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {!imageError ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          handleImageError(e, product.name);
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <Package className="h-24 w-24 text-primary-400 opacity-50" />
                      </div>
                    )}
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(0, 4).map((image, idx) => (
                        <div key={idx} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={image}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, product.name)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-500">{product.brand}</span>
                      {product.category && (
                        <>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-500 capitalize">{product.category.replace('-', ' ')}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  {product.price && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary-600">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.priceIncludesGst && (
                          <span className="ml-2 text-sm text-gray-600">(GST Included)</span>
                        )}
                      </div>
                      {product.bulkDiscountPercentage && product.bulkDiscountPercentage > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Get {product.bulkDiscountPercentage}% off on bulk orders!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Toy-Specific Information */}
                  {(product.ageGroup || product.occasion || product.gender || product.materialType || product.educationalValue) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Details</h3>
                      {product.ageGroup && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Age Group:</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{product.ageGroup}</span>
                        </div>
                      )}
                      {product.gender && product.gender !== 'all' && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Gender:</span>
                          <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium capitalize">{product.gender}</span>
                        </div>
                      )}
                      {product.occasion && product.occasion.length > 0 && (
                        <div className="flex items-start text-sm">
                          <span className="font-medium text-gray-700 w-24 mt-1">Occasion:</span>
                          <div className="flex flex-wrap gap-2">
                            {product.occasion.map((occ, idx) => (
                              <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium capitalize">
                                {occ}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.materialType && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Material:</span>
                          <span className="text-gray-600">{product.materialType}</span>
                        </div>
                      )}
                      {product.educationalValue && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Type:</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Educational</span>
                        </div>
                      )}
                      {product.minimumOrderQuantity && product.minimumOrderQuantity > 1 && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">MOQ:</span>
                          <span className="text-gray-600">{product.minimumOrderQuantity} units</span>
                        </div>
                      )}
                      {product.stockQuantity !== undefined && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Stock:</span>
                          <span className={product.stockQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {product.stockQuantity > 0 ? `${product.stockQuantity} units available` : 'Out of stock'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h3>
                      <ul className="space-y-1">
                        {product.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decrementQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">−</span>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(product.minimumOrderQuantity || 1, val));
                        }}
                        min={product.minimumOrderQuantity || 1}
                        className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
                      />
                      <button
                        onClick={incrementQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">+</span>
                      </button>
                      {product.minimumOrderQuantity && product.minimumOrderQuantity > 1 && (
                        <span className="text-xs text-gray-500">MOQ: {product.minimumOrderQuantity}</span>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Enquiry Button */}
                  <button
                    onClick={handleWhatsAppEnquiry}
                    className="w-full bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Enquire on WhatsApp
                  </button>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>Note:</strong> This is an enquiry-only platform. All orders are processed through WhatsApp. 
                      Our team will provide wholesale pricing, stock availability, and delivery options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
