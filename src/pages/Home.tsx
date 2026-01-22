import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart,
  Store,
  Package,
  ArrowRight, 
  Star, 
  CheckCircle,
  Gift,
  Sparkles,
  Users,
  Truck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import SEO from '../components/SEO';
import { contentApi } from '../utils/api';
import type { Product } from '../types/catalog';
import ProductDetailModal from '../components/ProductDetailModal';
import ProductCard from '../components/ProductCard';
import { getPlaceholderImage } from '../utils/imagePlaceholder';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  imageAlt?: string;
  primaryButton: { text: string; link: string };
  secondaryButton?: { text: string; link: string };
  overlay?: 'light' | 'dark' | 'none';
}

// Map database product to frontend Product interface
function mapDbProductToFrontend(dbProduct: any): Product {
  const images = dbProduct.images ? (Array.isArray(dbProduct.images) ? dbProduct.images : [dbProduct.images]) : [];
  if (dbProduct.image && !images.includes(dbProduct.image)) {
    images.unshift(dbProduct.image);
  }
  if (images.length === 0 || !images[0] || images[0].trim() === '') {
    images.push(getPlaceholderImage(400, 300, dbProduct.name || 'Product'));
  }

  const features = dbProduct.features ? (Array.isArray(dbProduct.features) ? dbProduct.features : []) : [];
  const specifications = dbProduct.specifications ? (typeof dbProduct.specifications === 'object' ? dbProduct.specifications : {}) : {};

  // Parse occasion from JSON if it's a string
  let occasion: string[] = [];
  if (dbProduct.occasion) {
    if (typeof dbProduct.occasion === 'string') {
      try {
        occasion = JSON.parse(dbProduct.occasion);
      } catch {
        occasion = [dbProduct.occasion];
      }
    } else if (Array.isArray(dbProduct.occasion)) {
      occasion = dbProduct.occasion;
    }
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description || dbProduct.short_description || 'High-quality toy product',
    price: dbProduct.price || 0,
    originalPrice: undefined,
    images: images,
    category: dbProduct.category || 'toys',
    brand: dbProduct.brand || 'Khandelwal Toy Store',
    model: specifications.model || specifications.Model || dbProduct.name,
    inStock: dbProduct.stock_quantity ? dbProduct.stock_quantity > 0 : true,
    stockQuantity: dbProduct.stock_quantity || 0,
    rating: 4.5,
    reviews: 0,
    features: features,
    specifications: specifications,
    warranty: dbProduct.warranty || undefined,
    ageGroup: dbProduct.age_group,
    occasion: occasion,
    gender: dbProduct.gender,
    materialType: dbProduct.material_type,
    educationalValue: dbProduct.educational_value || false,
    minimumOrderQuantity: dbProduct.minimum_order_quantity || 1,
    bulkDiscountPercentage: dbProduct.bulk_discount_percentage || 0,
    sku: dbProduct.sku,
    priceIncludesGst: dbProduct.price_includes_gst || false
  };
}

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products from database
  const { data: dbProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map database products to frontend format and get best sellers (first 12 products)
  const bestSellers = useMemo(() => {
    const products = dbProducts
      .map(mapDbProductToFrontend)
      .filter((product: Product) => product.inStock); // Only show in-stock products
    
    // Return first 12 products as best sellers (you can add a "bestseller" flag in DB later)
    return products.slice(0, 12);
  }, [dbProducts]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const heroSlides: HeroSlide[] = [
    {
      id: '1',
      title: 'Wholesale Prices,',
      subtitle: 'Unmatched Quality',
      description: 'Order in bulk and save! Minimum quantity, maximum discount. High-quality toys for retailers, distributors, and e-commerce platforms across India.',
      image: '/images/hero/toys-hero.jpg',
      imageAlt: 'Wholesale toys collection',
      primaryButton: { text: 'View Products', link: '/products' },
      secondaryButton: { text: 'Get Quote', link: '/contact' },
      overlay: 'dark'
    },
    {
      id: '2',
      title: 'Products by',
      subtitle: 'AGES',
      description: 'Find the perfect toys for every age group! From infants (0-2 years) to teens (13+), we have age-appropriate toys that spark imagination and support development at every stage.',
      image: '/images/hero/products-by-age.jpg',
      imageAlt: 'Toys organized by age groups',
      primaryButton: { text: 'Browse by Age', link: '/products?filter=age' },
      secondaryButton: { text: 'View All Ages', link: '/products' },
      overlay: 'dark'
    },
    {
      id: '3',
      title: 'Products by',
      subtitle: 'OCCASIONS',
      description: 'Perfect toys for every occasion! Birthday gifts, holiday celebrations, back-to-school, festivals, and more. Find the right toy for every special moment.',
      image: '/images/hero/products-by-occasion.jpg',
      imageAlt: 'Toys for different occasions',
      primaryButton: { text: 'Browse by Occasion', link: '/products?filter=occasion' },
      secondaryButton: { text: 'View All Occasions', link: '/products' },
      overlay: 'dark'
    },
    {
      id: '4',
      title: 'Featured',
      subtitle: 'Toy Collections',
      description: 'Action figures, educational toys, board games, remote control toys, and more. Discover our best-selling collections.',
      image: '/images/hero/featured-toys.jpg',
      imageAlt: 'Featured toy collections',
      primaryButton: { text: 'View Collections', link: '/products?filter=featured' },
      secondaryButton: { text: 'New Arrivals', link: '/products?filter=new-arrival' },
      overlay: 'dark'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  };

  const categories = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Action Figures',
      description: 'Superheroes, characters, and collectible action figures for all ages.',
      features: ['Superhero Collections', 'Character Figures', 'Collectibles', 'Age 3+'],
      image: '/images/categories/action-figures.jpg',
      categoryLink: '/products?category=action-figures'
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: 'Educational & Learning',
      description: 'STEM toys, puzzles, and learning games that spark creativity and development.',
      features: ['STEM Toys', 'Puzzles & Games', 'Learning Aids', 'Age-Appropriate'],
      image: '/images/categories/educational-learning.jpg',
      categoryLink: '/products?category=educational-learning'
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Art & Crafts',
      description: 'Creative toys, coloring sets, and craft supplies for artistic expression.',
      features: ['Coloring Sets', 'Craft Kits', 'Art Supplies', 'Creative Play'],
      image: '/images/categories/art-crafts.jpg',
      categoryLink: '/products?category=art-crafts'
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: 'Remote Control Toys',
      description: 'Cars, drones, helicopters, and more exciting RC toys for kids and adults.',
      features: ['RC Cars', 'Drones', 'Helicopters', 'Battery Operated'],
      image: '/images/categories/remote-control.jpg',
      categoryLink: '/products?category=remote-control'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Board Games',
      description: 'Family games, strategy games, and card games for quality family time.',
      features: ['Family Games', 'Strategy Games', 'Card Games', 'Multi-Player'],
      image: '/images/categories/board-games.jpg',
      categoryLink: '/products?category=board-games'
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: 'Dolls & Doll Houses',
      description: 'Fashion dolls, baby dolls, and beautiful doll houses for imaginative play.',
      features: ['Fashion Dolls', 'Baby Dolls', 'Doll Houses', 'Accessories'],
      image: '/images/categories/dolls.jpg',
      categoryLink: '/products?category=dolls'
    }
  ];

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Bulk Discounts',
      description: 'Maximum discount on minimum quantity orders. Better prices for larger orders.'
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Pan-India Shipping',
      description: 'Fast and reliable delivery across India. Serving retailers and distributors nationwide.'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Quality Assured',
      description: 'High-quality toys that meet safety standards. Trusted by retailers across India.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Toy Retailer, Surat',
      rating: 5,
      comment: 'Great wholesale prices and excellent quality. My customers love the toys and I get good margins. Fast delivery too!',
      avatar: '/images/testimonials/rajesh.jpg'
    },
    {
      name: 'Priya Sharma',
      company: 'Online Toy Store',
      rating: 5,
      comment: 'Perfect for my e-commerce business. Bulk discounts help me stay competitive. Quality is consistent and packaging is excellent.',
      avatar: '/images/testimonials/priya.jpg'
    },
    {
      name: 'Amit Patel',
      company: 'Distributor, Gujarat',
      rating: 5,
      comment: 'Reliable supplier with wide range of products. Minimum order quantities are reasonable and bulk pricing is very competitive.',
      avatar: '/images/testimonials/amit.jpg'
    }
  ];

  const getOverlayClass = (overlay?: string) => {
    switch (overlay) {
      case 'dark':
        return 'bg-black/60';
      case 'light':
        return 'bg-white/40';
      default:
        return '';
    }
  };

  return (
    <>
      <SEO
        title="Khandelwal Toy Store - Wholesale Toy Supplier | Toys for Retailers & Distributors"
        description="Khandelwal Toy Store - Wholesale toy supplier in India. High-quality toys for retailers, distributors, and e-commerce platforms. Action figures, educational toys, board games, remote control toys, and more. Best wholesale prices with bulk discounts."
        path="/"
      />
      <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Colorful Kid-Friendly Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 to-yellow-400 animate-gradient-xy"></div>
          
          {/* Floating Colorful Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large Circles */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
            
            {/* Medium Circles */}
            <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-orange-300 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-blob animation-delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-purple-300 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-blob animation-delay-3000"></div>
            
            {/* Small Colorful Dots */}
            <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-red-400 rounded-full opacity-50 animate-bounce"></div>
            <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-cyan-400 rounded-full opacity-50 animate-bounce animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-lime-400 rounded-full opacity-50 animate-bounce animation-delay-2000"></div>
          </div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-white/20"></div>
        </div>

        {/* Slides Container */}
        <div className="relative h-full w-full z-10">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Note: Video background is now the primary background for all slides */}

              {/* Content - Left Aligned */}
              <div className="relative z-20 h-full flex items-center pt-20 pb-32 md:pt-0 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl pr-12 sm:pr-16 md:pr-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words drop-shadow-2xl" style={{
                      textShadow: '3px 3px 6px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)'
                    }}>
                      {slide.title}
                      {slide.subtitle && (
                        <span className="block mt-1 sm:mt-2 break-words">{slide.subtitle}</span>
                      )}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mb-6 sm:mb-8 leading-relaxed max-w-2xl break-words font-semibold drop-shadow-lg" style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link
                        to={slide.primaryButton.link}
                        className="bg-white text-primary-600 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:bg-yellow-100 hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-fit shadow-xl border-4 border-yellow-300"
                      >
                        {slide.primaryButton.text}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      </Link>
                      {slide.secondaryButton && (
                        <Link
                          to={slide.secondaryButton.link}
                          className="bg-primary-600 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:bg-primary-700 hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-fit shadow-xl border-4 border-white"
                        >
                          {slide.secondaryButton.text}
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-yellow-100 backdrop-blur-sm text-primary-600 p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center shadow-xl border-4 border-yellow-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 font-bold" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-yellow-100 backdrop-blur-sm text-primary-600 p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center shadow-xl border-4 border-yellow-300"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 font-bold" />
        </button>

        {/* Bottom Slide Titles Navigation - Desktop */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden lg:flex items-center gap-4 xl:gap-6 px-4 max-w-[90vw] overflow-x-auto scrollbar-hide">
          {heroSlides.map((slide, index) => {
            // Create a compact title for display
            const displayTitle = slide.subtitle 
              ? `${slide.title.replace(' &', '')} ${slide.subtitle}`
              : slide.title;
            
            return (
              <React.Fragment key={slide.id}>
                {index > 0 && <div className="h-4 w-px bg-white/70 flex-shrink-0"></div>}
                <button
                  onClick={() => goToSlide(index)}
                  className={`text-xs xl:text-sm font-bold transition-all duration-300 relative whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full ${
                    index === currentSlide
                      ? 'text-white bg-white/30 backdrop-blur-sm shadow-lg border-2 border-yellow-300'
                      : 'text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                  aria-label={`Go to slide: ${displayTitle}`}
                  style={{
                    textShadow: index === currentSlide ? '2px 2px 4px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {displayTitle}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom Slide Indicators - Mobile (Dots/Lines) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 shadow-lg ${
                index === currentSlide
                  ? 'w-10 h-3 bg-yellow-300 border-2 border-white'
                  : 'w-3 h-3 bg-white/70 hover:bg-white border-2 border-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 z-30">
            <div
              key={currentSlide}
              className="h-full bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400"
              style={{
                width: '0%',
                animation: 'slideProgress 6s linear forwards',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
              }}
            />
          </div>
        )}
      </section>

      <style>{`
        @keyframes slideProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>

      {/* Promotional Banners Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-12 w-12 text-primary-500 mr-4" />
                <h3 className="text-2xl font-bold text-gray-900">Products by AGES</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Find age-appropriate toys for every stage of childhood. From baby rattles (0-2 years) to teen collectibles (13+), 
                we have toys that match developmental needs and interests.
              </p>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">0-2 Years</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">3-5 Years</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">6-8 Years</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">9-12 Years</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium">13+ Years</span>
                </div>
              </div>
              <Link to="/products?filter=age" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center">
                Browse by Age <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Gift className="h-12 w-12 text-primary-500 mr-4" />
                <h3 className="text-2xl font-bold text-gray-900">Products by OCCASIONS</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Perfect toys for every special moment! Whether it's a birthday, holiday, festival, or back-to-school season, 
                find the ideal toy that makes every occasion memorable.
              </p>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Birthday</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">Holidays</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Festivals</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Back to School</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Gift Sets</span>
                </div>
              </div>
              <Link to="/products?filter=occasion" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center">
                Browse by Occasion <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Products</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Wide range of high-quality toys at wholesale prices. From action figures to educational toys, we have everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.categoryLink || '/products'}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2 relative block"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 via-primary-200 to-secondary-200 flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 absolute inset-0"
                    onError={(e) => {
                      // Hide image on error, fallback gradient and icon will show
                      const target = e.target as HTMLImageElement;
                      if (target) {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  {/* Fallback Icon (shown when image fails or as background) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-primary-600 text-6xl opacity-30">
                      {category.icon}
                    </div>
                  </div>
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {category.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-4">
                    {category.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center text-xs text-gray-700 group-hover:text-gray-900 transition-colors">
                        <div className="flex-shrink-0 mr-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* View Products Link */}
                  <div className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                    <span>View Products</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100/0 to-primary-100/0 group-hover:from-primary-100/30 group-hover:to-transparent rounded-bl-full transition-all duration-300 pointer-events-none"></div>
              </Link>
            ))}
          </div>

          {/* View All Products CTA */}
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>View All Products</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </section>

      {/* Best Sellers Section - Moved Up */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Best Sellers</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Popular Toys
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular toys that retailers and distributors love to stock
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleProductClick}
                  showBestSellerBadge={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Browse All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          {/* View All Products CTA */}
          {bestSellers.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>View All Products</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Moved Down */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Khandelwal Toy Store?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your trusted wholesale partner for high-quality toys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 9.017-9.57v2.343c-3.23 0-5.701 2.238-5.701 5.7v3.391h6.684v7.136h-9.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-9.57v2.343c-3.23 0-5.7 2.238-5.7 5.7v3.391h6.717v7.136h-9.017z"/>
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Rating Stars */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial Comment */}
                  <p className="text-gray-700 mb-6 leading-relaxed text-base relative">
                    <span className="text-primary-600 text-3xl font-bold leading-none absolute -top-2 -left-2">"</span>
                    <span className="pl-4">{testimonial.comment}</span>
                    <span className="text-primary-600 text-3xl font-bold leading-none">"</span>
                  </p>

                  {/* Client Info */}
                  <div className="flex items-center pt-4 border-t border-gray-100">
                    {/* Avatar */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                    {/* Verified Badge */}
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50/50 group-hover:to-transparent rounded-bl-full transition-all duration-300"></div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-gray-700 font-medium">100+ Satisfied Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-gray-700 font-medium">4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-6 w-6 text-primary-600" />
                <span className="text-gray-700 font-medium">Pan-India Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Stock Quality Toys?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get wholesale pricing and bulk discounts on quality toys. Contact us for a quote and start your toy business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Get Quote
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors backdrop-blur-sm bg-white/10"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
    </>
  );
};

export default Home;
