import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Navigation, 
  Wrench, 
  Search,
  Filter,
  Star,
  ShoppingCart,
  Eye,
  CheckCircle
} from 'lucide-react';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const products = [
    {
      id: '1',
      name: 'HD IP Camera 4MP',
      description: 'High-definition IP camera with night vision and motion detection capabilities.',
      price: 8500,
      originalPrice: 10000,
      images: ['/api/placeholder/300/200'],
      category: 'cctv',
      brand: 'Hikvision',
      model: 'DS-2CD2143G0-I',
      inStock: true,
      stockQuantity: 15,
      rating: 4.8,
      reviews: 24,
      features: [
        '4MP HD Resolution',
        'Night Vision up to 30m',
        'Motion Detection',
        'Weather Resistant',
        'Mobile App Support'
      ],
      specifications: {
        'Resolution': '4MP (2560×1440)',
        'Lens': '2.8mm Fixed',
        'Night Vision': '30m IR Range',
        'Storage': 'MicroSD up to 128GB',
        'Power': '12V DC / PoE'
      }
    },
    {
      id: '2',
      name: 'GPS Tracker with SIM',
      description: 'Real-time GPS tracking device with built-in SIM card and long battery life.',
      price: 4500,
      originalPrice: 5500,
      images: ['/api/placeholder/300/200'],
      category: 'gps',
      brand: 'Queclink',
      model: 'GV300',
      inStock: true,
      stockQuantity: 8,
      rating: 4.6,
      reviews: 18,
      features: [
        'Real-time Tracking',
        'Geofencing',
        'SOS Button',
        'Long Battery Life',
        'Waterproof Design'
      ],
      specifications: {
        'Battery': '5000mAh',
        'Standby Time': '30 Days',
        'GPS Accuracy': '3-5 meters',
        'Network': '2G/3G/4G',
        'Operating Temperature': '-20°C to +70°C'
      }
    },
    {
      id: '3',
      name: 'DVR 8 Channel',
      description: '8-channel digital video recorder with H.264 compression and remote access.',
      price: 12000,
      originalPrice: 15000,
      images: ['/api/placeholder/300/200'],
      category: 'cctv',
      brand: 'Dahua',
      model: 'DHI-NVR2108-8P-4KS2',
      inStock: true,
      stockQuantity: 5,
      rating: 4.7,
      reviews: 12,
      features: [
        '8 Channel Recording',
        '4K Resolution Support',
        'H.264 Compression',
        'Remote Access',
        'Mobile App'
      ],
      specifications: {
        'Channels': '8',
        'Resolution': '4K (3840×2160)',
        'Storage': 'Up to 6TB HDD',
        'Compression': 'H.264/H.265',
        'Network': 'Gigabit Ethernet'
      }
    },
    {
      id: '4',
      name: 'Maintenance Kit Pro',
      description: 'Professional maintenance kit for CCTV and GPS equipment cleaning and calibration.',
      price: 2500,
      originalPrice: 3000,
      images: ['/api/placeholder/300/200'],
      category: 'maintenance',
      brand: 'TechCare',
      model: 'TC-MK-001',
      inStock: true,
      stockQuantity: 20,
      rating: 4.5,
      reviews: 8,
      features: [
        'Professional Tools',
        'Cleaning Solutions',
        'Calibration Equipment',
        'Protective Gear',
        'Instruction Manual'
      ],
      specifications: {
        'Tools': '15 Professional Tools',
        'Cleaning Kit': 'Complete Set',
        'Calibration': 'Digital Tools',
        'Warranty': '1 Year',
        'Weight': '2.5 kg'
      }
    },
    {
      id: '5',
      name: 'Wireless Camera System',
      description: 'Complete wireless camera system with 4 cameras and NVR for easy installation.',
      price: 25000,
      originalPrice: 30000,
      images: ['/api/placeholder/300/200'],
      category: 'cctv',
      brand: 'Ezviz',
      model: 'C6N-4PK',
      inStock: false,
      stockQuantity: 0,
      rating: 4.9,
      reviews: 31,
      features: [
        '4 Wireless Cameras',
        '1080p HD Recording',
        'Night Vision',
        'Mobile App',
        'Cloud Storage'
      ],
      specifications: {
        'Cameras': '4 Units',
        'Resolution': '1080p',
        'Range': '100m Wireless',
        'Storage': '1TB HDD',
        'Power': 'AC Adapter'
      }
    },
    {
      id: '6',
      name: 'Fleet GPS Tracker',
      description: 'Advanced fleet tracking device with fuel monitoring and driver behavior analysis.',
      price: 8500,
      originalPrice: 10000,
      images: ['/api/placeholder/300/200'],
      category: 'gps',
      brand: 'Teltonika',
      model: 'FMB920',
      inStock: true,
      stockQuantity: 3,
      rating: 4.8,
      reviews: 15,
      features: [
        'Fleet Management',
        'Fuel Monitoring',
        'Driver Behavior',
        'Route Optimization',
        'Real-time Alerts'
      ],
      specifications: {
        'GPS': 'High Precision',
        'Fuel Sensor': 'Built-in',
        'Connectivity': '4G LTE',
        'Battery': 'Backup Battery',
        'Installation': 'Professional'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'cctv', name: 'CCTV Equipment' },
    { id: 'gps', name: 'GPS Trackers' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              High-quality security and tracking equipment from leading brands
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400">
                    {product.category === 'cctv' && <Camera className="h-16 w-16" />}
                    {product.category === 'gps' && <Navigation className="h-16 w-16" />}
                    {product.category === 'maintenance' && <Wrench className="h-16 w-16" />}
                  </div>
                </div>
                {!product.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Out of Stock
                  </div>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Sale
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Brand and Rating */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center mb-4">
                  {product.inStock ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">In Stock ({product.stockQuantity})</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <span className="text-sm">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  <button
                    disabled={!product.inStock}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      product.inStock
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
