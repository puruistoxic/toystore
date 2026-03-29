import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, MessageCircle, Star, CheckCircle, Package, ShoppingCart, Play } from 'lucide-react';
import type { Product } from '../types/catalog';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';
import { getCanonicalUrl } from '../utils/seo';
import { useCart } from '../contexts/CartContext';
import { useAddToListModal } from '../contexts/AddToListModalContext';
import { parseYoutubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from '../utils/youtube';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  /** Listing preview: shorter copy, no videos/features block, link to full PDP */
  variant?: 'default' | 'quickLook';
}

const WHATSAPP_NUMBER = '919898524462';

const QUICK_DESC_MAX = 420;

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  variant = 'default',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const { items } = useCart();
  const { openAddToList } = useAddToListModal();

  const inList = Boolean(
    product && items.some((l) => l.productId === String(product.id)),
  );

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setImageError(false);
      setActiveImgIdx(0);
      setOpenVideoId(null);
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const quickLook = variant === 'quickLook';
  const descriptionText = product.description?.trim() || '';
  const descriptionTruncated =
    quickLook && descriptionText.length > QUICK_DESC_MAX
      ? `${descriptionText.slice(0, QUICK_DESC_MAX).trim()}…`
      : descriptionText;

  const handleWhatsAppEnquiry = () => {
    const productPageUrl = getCanonicalUrl(`/products/${product.slug}`);
    const lines = [
      'Hello Khandelwal Toy Store,',
      '',
      "I'm interested in this product:",
      '',
      `Product: ${product.name}`,
      product.brand ? `Brand: ${product.brand}` : '',
      `Quantity: ${quantity}`,
      `Product page: ${productPageUrl}`,
      '',
      'Please confirm:',
      '- In-stock / when I can collect',
      '- Final price (if different from website)',
      '- Store timings or delivery options nearby',
      '',
      'Thank you!',
    ].filter(Boolean);
    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const imgs =
    product.images && product.images.length > 0
      ? product.images
      : [getPlaceholderImage(600, 400, product.name)];
  const safeIdx = Math.min(Math.max(0, activeImgIdx), imgs.length - 1);
  const mainImage = imgs[safeIdx] || getPlaceholderImage(600, 400, product.name);

  const videoEntries = (product.videoUrls || [])
    .map((url) => {
      const id = parseYoutubeVideoId(url);
      return id ? { id, url } : null;
    })
    .filter((x): x is { id: string; url: string } => x !== null);

  return (
    <>
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
              <h3 className="text-lg font-semibold text-gray-900">
                {quickLook ? 'Quick look' : 'Product Details'}
              </h3>
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
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden min-h-[200px]">
                    {!imageError ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover min-h-[200px]"
                        onError={(e) => {
                          handleImageError(e, product.name);
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 min-h-[200px]">
                        <Package className="h-24 w-24 text-primary-400 opacity-50" />
                      </div>
                    )}
                  </div>
                  {imgs.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {imgs.map((image, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveImgIdx(idx);
                            setImageError(false);
                          }}
                          className={`aspect-square bg-gray-100 rounded overflow-hidden ring-2 ring-offset-1 transition-shadow ${
                            safeIdx === idx ? 'ring-teal-500' : 'ring-transparent hover:ring-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, product.name)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {!quickLook && videoEntries.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Videos</h4>
                      <div className="flex flex-wrap gap-2">
                        {videoEntries.map(({ id }, idx) => (
                          <button
                            key={id + idx}
                            type="button"
                            onClick={() => setOpenVideoId(id)}
                            className="relative w-[calc(50%-4px)] sm:w-32 aspect-video rounded-lg overflow-hidden bg-gray-900 group focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <img
                              src={youtubeThumbnailUrl(id)}
                              alt=""
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40">
                              <span className="rounded-full bg-white/95 p-2 shadow-md">
                                <Play className="h-5 w-5 text-red-600 fill-current" />
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
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
                    </div>
                  )}

                  {/* Toy-Specific Information */}
                  {!quickLook &&
                    (product.ageGroup || product.occasion || product.gender || product.materialType || product.educationalValue) && (
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
                      {product.stockQuantity !== undefined && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Stock:</span>
                          <span className={product.stockQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {quickLook && (product.ageGroup || product.stockQuantity !== undefined) && (
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {product.ageGroup && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {product.ageGroup}
                        </span>
                      )}
                      {product.stockQuantity !== undefined && (
                        <span
                          className={
                            product.stockQuantity > 0
                              ? 'text-green-700 font-medium'
                              : 'text-red-600 font-medium'
                          }
                        >
                          {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {descriptionText && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {descriptionTruncated}
                      </p>
                      {quickLook && descriptionText.length > QUICK_DESC_MAX && (
                        <p className="mt-2 text-xs text-gray-500">
                          Full write-up, specs, and more on the product page.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {!quickLook && product.features && product.features.length > 0 && (
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
                          const val = parseInt(e.target.value, 10) || 1;
                          setQuantity(Math.max(1, val));
                        }}
                        min={1}
                        className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
                      />
                      <button
                        onClick={incrementQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>

                  {quickLook && (
                    <div>
                      <Link
                        to={`/products/${product.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:text-primary-700 hover:underline"
                      >
                        Open full product page
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppEnquiry}
                      className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Enquire on WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => openAddToList(product, { initialQuantity: quantity })}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold border-2 transition-colors flex items-center justify-center gap-2 ${
                        inList
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50'
                      }`}
                      aria-label={
                        inList
                          ? 'Product is in your order list. Click to add more with selected quantity.'
                          : 'Add to order list'
                      }
                    >
                      <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden />
                      {inList ? 'In your list' : 'Add to list'}
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>Note:</strong> We’re a local toy shop — use WhatsApp to double-check stock and price before you visit. We’ll help with pickup, timing, or delivery where available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {openVideoId && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
        onClick={() => setOpenVideoId(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Video"
      >
        <div
          className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setOpenVideoId(null)}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 text-white p-2 hover:bg-black/80"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="aspect-video w-full">
            <iframe
              title="YouTube video"
              src={youtubeEmbedUrl(openVideoId)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default ProductDetailModal;
