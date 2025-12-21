import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Heart, Star, CheckCircle, Truck, Shield, RotateCcw, MapPin, Image as ImageIcon } from 'lucide-react';
import { contentApi } from '../utils/api';
import type { Product } from '../types/catalog';
import SEO from '../components/SEO';
import { generateProductMetaDescription, generatePageTitle } from '../utils/seo';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';
import QuoteRequestModal from '../components/QuoteRequestModal';

// Map database product to frontend Product interface
function mapDbProductToFrontend(dbProduct: any): Product {
  const images = dbProduct.images ? (Array.isArray(dbProduct.images) ? dbProduct.images : [dbProduct.images]) : [];
  if (dbProduct.image && !images.includes(dbProduct.image)) {
    images.unshift(dbProduct.image);
  }
  if (images.length === 0 || !images[0] || images[0].trim() === '') {
    images.push(getPlaceholderImage(800, 600, dbProduct.name || 'Product'));
  }

  const features = dbProduct.features ? (Array.isArray(dbProduct.features) ? dbProduct.features : []) : [];
  const specifications = dbProduct.specifications ? (typeof dbProduct.specifications === 'object' ? dbProduct.specifications : {}) : {};

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description || dbProduct.short_description || 'Professional IT solution',
    price: dbProduct.price || 0,
    originalPrice: undefined, // No pricing displayed
    images: images,
    category: dbProduct.category || 'accessories',
    brand: dbProduct.brand || 'WAINSO',
    model: specifications.model || specifications.Model || dbProduct.name,
    inStock: true, // Default to in stock if not specified
    stockQuantity: 0, // Not tracked in current schema
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    features: features,
    specifications: specifications,
    warranty: dbProduct.warranty || undefined
  };
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Fetch product from database by slug
  const { data: dbProduct, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await contentApi.getProduct(slug!);
      return response.data;
    },
    enabled: !!slug,
  });

  const product = dbProduct ? mapDbProductToFrontend(dbProduct) : undefined;

  if (isLoading) {
    return (
      <>
        <SEO
          title="Loading Product | WAINSO"
          description="Loading product details..."
          path="/products/loading"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO
          title="Product Not Found | WAINSO"
          description="The product you are looking for may have been moved or no longer exists."
          path="/products/not-found"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-6">The product you are looking for may have been moved or no longer exists.</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  const metaDescription = generateProductMetaDescription(product.name, product.brand);
  const pageTitle = generatePageTitle(`${product.name} - ${product.brand}`);

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription}
        path={`/products/${product.slug}`}
        type="product"
      />
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/products" className="text-gray-500 hover:text-primary-600">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => handleImageError(e, product.name)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mb-2" />
                    <p className="text-sm">{product.name}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(product.images && product.images.length > 0 ? product.images : [getPlaceholderImage(200, 150, product.name)]).map((image, index) => (
                <div key={`${image}-${index}`} className="bg-white rounded-lg p-2">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="h-full w-full object-cover"
                      onError={(e) => handleImageError(e, product.name)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-500">{product.brand}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.model}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Location Badge (only for CCTV/Security categories) */}
            {(product.category === 'security' || product.category === 'cctv') && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                  <MapPin className="h-4 w-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span className="font-medium">Available in Ramgarh, Jharkhand</span>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <Shield className="h-4 w-4 text-primary-600 mr-2" />
                Deployment, warranty, and integration assistance included.
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-primary-600 mr-2" />
                On-site and remote delivery with pan-India support options.
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <RotateCcw className="h-4 w-4 text-primary-600 mr-2" />
                Need sizing help? Share your use case and we’ll propose a fit.
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Request Quote
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-900">
                Looking for deployment + AMC? Add that in your quote request and we’ll bundle implementation, training, and SLAs.
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 font-medium">{key}:</dt>
                        <dd className="text-gray-900">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Warranty */}
            {product.warranty && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">{product.warranty}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-gray-600">Free delivery available</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Warranty</h3>
            <p className="text-gray-600">2 years manufacturer warranty</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day return policy</p>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {product && (
        <QuoteRequestModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          product={product}
          productId={product.id.toString()}
        />
      )}
    </div>
    </>
  );
};

export default ProductDetail;
