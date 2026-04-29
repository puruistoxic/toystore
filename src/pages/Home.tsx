import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Store,
  Package,
  ArrowRight, 
  Star, 
  CheckCircle,
  Gift,
  Users,
  Truck,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import SEO from '../components/SEO';
import { contentApi } from '../utils/api';
import { mapDbProductToFrontend } from '../utils/catalogFromDb';
import type { Product } from '../types/catalog';
import ProductDetailModal from '../components/ProductDetailModal';
import ProductCard from '../components/ProductCard';
import HeroPromotedProductSlider from '../components/HeroPromotedProductSlider';
import { filterProductsForHeroSlide } from '../constants/homeHeroBanners';

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

const heroSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Your neighbourhood',
    subtitle: 'store',
    description:
      'Walk in, browse online, and take home quality products for every age. Friendly advice, fair prices, and gifts kids love — right here in your area.',
    image: '/images/hero/toys-hero.jpg',
    imageAlt: 'Colourful products at DigiDukaanLive',
    primaryButton: { text: 'Shop now', link: '/products' },
    secondaryButton: { text: 'Visit or contact us', link: '/contact' },
    overlay: 'dark',
  },
  {
    id: '2',
    title: 'Products by',
    subtitle: 'AGES',
    description:
      'Find the perfect toys for every age group! From infants (0-2 years) to teens (13+), we have age-appropriate toys that spark imagination and support development at every stage.',
    image: '/images/hero/products-by-age.jpg',
    imageAlt: 'Toys organized by age groups',
    primaryButton: { text: 'Browse by Age', link: '/products?filter=age' },
    secondaryButton: { text: 'View All Ages', link: '/products' },
    overlay: 'dark',
  },
  {
    id: '3',
    title: 'Products by',
    subtitle: 'OCCASIONS',
    description:
      'Perfect toys for every occasion! Birthday gifts, holiday celebrations, back-to-school, festivals, and more. Find the right toy for every special moment.',
    image: '/images/hero/products-by-occasion.jpg',
    imageAlt: 'Toys for different occasions',
    primaryButton: { text: 'Browse by Occasion', link: '/products?filter=occasion' },
    secondaryButton: { text: 'View All Occasions', link: '/products' },
    overlay: 'dark',
  },
  {
    id: '4',
    title: 'Featured',
    subtitle: 'Collections',
    description:
      'Action figures, learning sets, board games, remote control models, and more. Discover our best-selling collections.',
    image: '/images/hero/featured-toys.jpg',
    imageAlt: 'Featured collections',
    primaryButton: { text: 'View Collections', link: '/products?filter=featured' },
    secondaryButton: { text: 'New Arrivals', link: '/products?filter=new-arrival' },
    overlay: 'dark',
  },
];

const HERO_SLIDE_COUNT = heroSlides.length;

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

  const { data: bannerDbProducts = [] } = useQuery({
    queryKey: ['products', 'home-banner'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ home_banner: true, is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Map database products to frontend format and get best sellers (first 12 products)
  const bestSellers = useMemo(() => {
    const products = dbProducts
      .map(mapDbProductToFrontend)
      .filter((product: Product) => product.inStock); // Only show in-stock products
    
    // Return first 12 products as best sellers (you can add a "bestseller" flag in DB later)
    return products.slice(0, 12);
  }, [dbProducts]);

  const bannerProducts = useMemo(() => {
    const sorted = [...bannerDbProducts].sort((a, b) => {
      const ao = Number((a as { banner_sort_order?: number }).banner_sort_order) || 0;
      const bo = Number((b as { banner_sort_order?: number }).banner_sort_order) || 0;
      if (ao !== bo) return ao - bo;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
    return sorted.map(mapDbProductToFrontend);
  }, [bannerDbProducts]);

  const bannerProductsForCurrentSlide = useMemo(() => {
    const slideId = heroSlides[currentSlide]?.id;
    if (!slideId) return [];
    return filterProductsForHeroSlide(bannerProducts, slideId);
  }, [bannerProducts, currentSlide]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDE_COUNT);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % HERO_SLIDE_COUNT);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + HERO_SLIDE_COUNT) % HERO_SLIDE_COUNT);
  };

  const features = [
    {
      icon: <Store className="h-6 w-6" />,
      title: 'Shop in person',
      description: 'See products before you buy. Our team helps you pick the right item for the right age.'
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Local pickup & delivery',
      description: 'Convenient options for nearby customers. Ask us what works best for your area.'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Quality you can trust',
      description: 'Curated products with safety and durability in mind — the same standards we’d want for our own families.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Parent, local customer',
      rating: 5,
      comment:
        'Staff helped us pick a birthday gift for our 5-year-old — great quality and my son hasn’t put it down. Will come back for festivals.',
      avatar: '/images/testimonials/rajesh.jpg'
    },
    {
      name: 'Priya Sharma',
      company: 'Grandparent',
      rating: 5,
      comment:
        'Nice variety under one roof. I could compare a few options and the prices felt fair. Easy to find parking and quick checkout.',
      avatar: '/images/testimonials/priya.jpg'
    },
    {
      name: 'Amit Patel',
      company: 'Neighbourhood shopper',
      rating: 5,
      comment:
        'We message on WhatsApp to check stock before visiting. They’re responsive and products match what we saw online.',
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
        title="DigiDukaanLive | Online & local store — toys & gifts for kids"
        description="DigiDukaanLive is your online and local store. Browse action figures, educational toys, board games, RC toys, and gifts for birthdays and festivals. Visit us or enquire on WhatsApp."
        path="/"
        image="/images/hero/toys-hero.jpg"
        imageAlt="DigiDukaanLive — shop online and local"
      />
      <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Colorful Kid-Friendly Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-lavender via-brand-peach to-brand-sand animate-gradient-xy"></div>
          
          {/* Floating shapes — logo-adjacent palette */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-brand-sunshine rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-brand-peach rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-brand-sky rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-leaf rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
            <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-brand-coral rounded-full mix-blend-multiply filter blur-lg opacity-55 animate-blob animation-delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-brand-lavender rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-blob animation-delay-3000"></div>
            <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-brand-coral rounded-full opacity-45 animate-bounce"></div>
            <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-brand-sky rounded-full opacity-45 animate-bounce animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-brand-sunshine rounded-full opacity-50 animate-bounce animation-delay-2000"></div>
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

              {/* Content — headline left, promoted product slider right (lg+) */}
              <div className="relative z-20 h-full flex items-center pt-20 pb-28 sm:pb-32 md:pt-0 md:pb-28 lg:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div
                    className={`grid grid-cols-1 gap-8 lg:gap-10 items-center w-full ${
                      bannerProductsForCurrentSlide.length > 0 ? 'lg:grid-cols-12' : ''
                    }`}
                  >
                    <div
                      className={
                        bannerProductsForCurrentSlide.length > 0
                          ? 'lg:col-span-7 xl:col-span-6 max-w-3xl pr-0 sm:pr-8 lg:pr-4'
                          : 'max-w-3xl pr-12 sm:pr-16 md:pr-0'
                      }
                    >
                      <h1
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words drop-shadow-2xl"
                        style={{
                          textShadow: '3px 3px 6px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
                        }}
                      >
                        {slide.title}
                        {slide.subtitle && (
                          <span className="block mt-1 sm:mt-2 break-words">{slide.subtitle}</span>
                        )}
                      </h1>
                      <p
                        className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mb-6 sm:mb-8 leading-relaxed max-w-2xl break-words font-semibold drop-shadow-lg"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        }}
                      >
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                          to={slide.primaryButton.link}
                          className="bg-white text-primary-600 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:bg-brand-sand hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-fit shadow-xl border-4 border-brand-sunshine"
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

                    {bannerProductsForCurrentSlide.length > 0 && (
                      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-center xl:justify-end items-center">
                        <HeroPromotedProductSlider products={bannerProductsForCurrentSlide} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promoted products: horizontal strip on small screens; desktop uses hero-right slider */}
        {bannerProductsForCurrentSlide.length > 0 && (
          <div className="lg:hidden absolute bottom-14 sm:bottom-16 left-0 right-0 z-[25] pointer-events-none px-4 sm:px-6">
            <div className="max-w-7xl mx-auto pointer-events-auto">
              <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md mb-2 pl-0.5">
                In focus now
              </p>
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory touch-pan-x">
                {bannerProductsForCurrentSlide.map((product: Product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="snap-start flex-shrink-0 w-[6.75rem] sm:w-28 md:w-32 rounded-xl bg-white/95 shadow-lg border-2 border-brand-sunshine/90 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {product.name}
                      </p>
                      {product.price > 0 && (
                        <p className="text-[10px] sm:text-xs text-primary-600 font-bold mt-0.5">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-brand-sand backdrop-blur-sm text-primary-600 p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center shadow-xl border-4 border-brand-sunshine"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 font-bold" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-brand-sand backdrop-blur-sm text-primary-600 p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center shadow-xl border-4 border-brand-sunshine"
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
                  className={`text-sm lg:text-base xl:text-lg font-bold transition-all duration-300 relative whitespace-nowrap flex-shrink-0 px-4 py-2.5 rounded-full ${
                    index === currentSlide
                      ? 'text-white bg-white/30 backdrop-blur-sm shadow-lg border-2 border-brand-sunshine'
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
                  ? 'w-10 h-3 bg-brand-sunshine border-2 border-white'
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
              className="h-full bg-gradient-to-r from-brand-sunshine via-brand-coral to-brand-lavender"
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

      {/* Popular picks / best sellers — first major section after hero (drives sales) */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-primary-50/80 via-white to-white relative overflow-hidden border-t-4 border-primary-500 shadow-[0_-10px_36px_-18px_rgba(232,90,42,0.22)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-block mb-3">
              <span className="text-primary-600 font-display font-bold text-sm uppercase tracking-[0.2em]">
                Best sellers
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Popular picks
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Favourites families ask for again and again — great starting points when you visit the store.
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100">
                  <div className="h-64 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
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

          {bestSellers.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-display font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>View all products</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

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

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose DigiDukaanLive?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Why families shop with us
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
              What our customers say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Word from shoppers who’ve visited the store or ordered with us
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
                <span className="text-gray-700 font-medium">Happy families & repeat shoppers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-gray-700 font-medium">4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-6 w-6 text-primary-600" />
                <span className="text-gray-700 font-medium">Helpful team on site & WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Looking for the perfect product or gift?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Message us on WhatsApp, call, or drop by — we’ll help with stock, suggestions for age and budget, and store timings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Contact & location
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
