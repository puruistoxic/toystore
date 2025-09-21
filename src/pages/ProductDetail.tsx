import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, CheckCircle, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock product data - in real app, fetch based on id
  const product = {
    id: '1',
    name: 'HD IP Camera 4MP',
    description: 'High-definition IP camera with night vision and motion detection capabilities. Perfect for both indoor and outdoor surveillance.',
    price: 8500,
    originalPrice: 10000,
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CD2143G0-I',
    inStock: true,
    stockQuantity: 15,
    rating: 4.8,
    reviews: 24,
    features: [
      '4MP HD Resolution (2560×1440)',
      'Night Vision up to 30m with IR LEDs',
      'Motion Detection with Email Alerts',
      'Weather Resistant IP67 Rating',
      'Mobile App Support (Hik-Connect)',
      'Wide Dynamic Range (WDR)',
      '3D Digital Noise Reduction',
      'Built-in Microphone'
    ],
    specifications: {
      'Resolution': '4MP (2560×1440)',
      'Lens': '2.8mm Fixed Lens',
      'Night Vision': '30m IR Range',
      'Storage': 'MicroSD up to 128GB',
      'Power': '12V DC / PoE',
      'Network': '10/100 Mbps Ethernet',
      'Operating Temperature': '-30°C to +60°C',
      'Dimensions': '70×70×150mm',
      'Weight': '0.5kg'
    },
    warranty: '2 Years Manufacturer Warranty'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/products" className="text-gray-500 hover:text-primary-600">
              Products
            </a>
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
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="text-6xl mb-2">📷</div>
                  <p>Product Image</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="bg-white rounded-lg p-2">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded flex items-center justify-center">
                    <div className="text-gray-400 text-xs">Image {index + 1}</div>
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

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </div>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                  Save ₹{(product.originalPrice - product.price).toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {product.inStock ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>In Stock ({product.stockQuantity} available)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                disabled={!product.inStock}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  product.inStock
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Features */}
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

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-600 font-medium">{key}:</dt>
                      <dd className="text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Warranty */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">{product.warranty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-gray-600">Free delivery on orders above ₹5,000</p>
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
    </div>
  );
};

export default ProductDetail;
