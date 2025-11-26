import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  MapPin, 
  Wrench, 
  ArrowRight, 
  Star, 
  CheckCircle,
  Camera,
  Navigation,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO';

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

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const heroSlides: HeroSlide[] = [
    {
      id: '1',
      title: 'Professional Security &',
      subtitle: 'Tracking Solutions',
      description: 'Trusted security solutions across Jharkhand. 8+ years of excellence in CCTV, GPS tracking, and maintenance services.',
      image: '/images/hero/hero-main.jpg',
      imageAlt: 'Professional security and tracking solutions',
      primaryButton: { text: 'Learn More', link: '/services' },
      overlay: 'dark'
    },
    {
      id: '2',
      title: 'Advanced CCTV Systems',
      subtitle: '24/7 Surveillance Protection',
      description: 'HD IP cameras with night vision, motion detection, and mobile access. Professional installation included.',
      image: '/images/hero/cctv-systems.jpg',
      imageAlt: 'CCTV surveillance systems',
      primaryButton: { text: 'View CCTV Solutions', link: '/services?category=cctv-installation' },
      secondaryButton: { text: 'Get Quote', link: '/quote-request' },
      overlay: 'dark'
    },
    {
      id: '3',
      title: 'Real-Time GPS Tracking',
      subtitle: 'Fleet & Vehicle Management',
      description: 'Monitor vehicles in real-time with GPS tracking, fuel monitoring, and driver analytics. Reduce costs, boost efficiency.',
      image: '/images/hero/gps-tracking.jpg',
      imageAlt: 'GPS tracking solutions',
      primaryButton: { text: 'Explore GPS Solutions', link: '/services?category=gps-installation' },
      secondaryButton: { text: 'Request Quote', link: '/quote-request' },
      overlay: 'dark'
    },
    {
      id: '4',
      title: 'Expert Maintenance Services',
      subtitle: 'Keep Your Systems Running',
      description: 'Complete maintenance, repair, and troubleshooting for all security equipment. 24/7 support available.',
      image: '/images/hero/maintenance-services.jpg',
      imageAlt: 'Maintenance and repair services',
      primaryButton: { text: 'View Services', link: '/services?category=maintenance' },
      secondaryButton: { text: 'Contact Us', link: '/contact' },
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

  // Ensure video plays on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        // Autoplay was prevented, which is fine - user interaction will start it
        console.log('Video autoplay prevented:', error);
      });
    }
  }, []);

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

  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => new Set(prev).add(imagePath));
  };

  const services = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: 'CCTV Installation',
      description: 'Professional surveillance systems for complete security coverage',
      features: ['HD Cameras', 'Remote Monitoring', 'Night Vision', 'Mobile App']
    },
    {
      icon: <Navigation className="h-8 w-8" />,
      title: 'GPS Tracking',
      description: 'Real-time vehicle and asset tracking solutions',
      features: ['Real-time Tracking', 'Geofencing', 'Fuel Monitoring', 'Reports']
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: 'Maintenance',
      description: 'Comprehensive maintenance services for all your equipment',
      features: ['Preventive Maintenance', '24/7 Support', 'Quick Response', 'Warranty']
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security solutions with 99.9% uptime'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Wide Service Coverage',
      description: 'Serving Ramgarh, Ramgarh Cantt, and across Jharkhand, India with professional installation and support'
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Expert Technicians',
      description: 'Certified professionals with years of experience'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Kumar Industries',
      rating: 5,
      comment: 'Excellent CCTV installation service. The team was professional and the system works perfectly.'
    },
    {
      name: 'Priya Sharma',
      company: 'Sharma Logistics',
      rating: 5,
      comment: 'GPS tracking has helped us reduce fuel costs by 15%. Highly recommended!'
    },
    {
      name: 'Amit Patel',
      company: 'Patel Manufacturing',
      rating: 5,
      comment: 'Outstanding maintenance service. Quick response time and reliable support.'
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
        title="WAINSO GPS & Security System - CCTV, GPS Tracking & Security Solutions in Ramgarh, Ramgarh Cantt, Jharkhand | India"
        description="Professional CCTV installation, GPS tracking, and security solutions in Ramgarh, Ramgarh Cantt, Hazaribagh, Ranchi, Dhanbad, Bokaro, Jamshedpur, and across Jharkhand, India. Authorized dealers for CP Plus, Hikvision, Panasonic, Godrej. 8+ years experience, 4.9-star rating. Call +91 98998 60975."
        path="/"
      />
      <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            poster="/videos/banner-background-poster.jpg"
            onLoadedData={() => {
              // Ensure video plays
              if (videoRef.current) {
                videoRef.current.play().catch(() => {
                  // Handle autoplay restrictions
                });
              }
            }}
          >
            {/* WebM format (better compression, smaller file size) */}
            <source src="/videos/banner-background.webm" type="video/webm" />
            {/* MP4 format (fallback for older browsers) */}
            <source src="/videos/banner-background.mp4" type="video/mp4" />
            {/* Fallback to gradient if video fails to load */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />
          </video>
          {/* Dark overlay on video */}
          <div className="absolute inset-0 bg-black/60" />
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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words">
                      {slide.title}
                      {slide.subtitle && (
                        <span className="block mt-1 sm:mt-2 break-words">{slide.subtitle}</span>
                      )}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-2xl break-words">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link
                        to={slide.primaryButton.link}
                        className="border border-white text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded text-sm sm:text-base font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center w-full sm:w-fit"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      </Link>
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
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 hidden sm:flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Bottom Slide Titles Navigation - Desktop */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden lg:flex items-center gap-4 xl:gap-6 text-white px-4 max-w-[90vw] overflow-x-auto scrollbar-hide">
          {heroSlides.map((slide, index) => {
            // Create a compact title for display
            const displayTitle = slide.subtitle 
              ? `${slide.title.replace(' &', '')} ${slide.subtitle}`
              : slide.title;
            
            return (
              <React.Fragment key={slide.id}>
                {index > 0 && <div className="h-4 w-px bg-white/50 flex-shrink-0"></div>}
                <button
                  onClick={() => goToSlide(index)}
                  className={`text-xs xl:text-sm font-medium transition-all duration-300 relative whitespace-nowrap flex-shrink-0 ${
                    index === currentSlide
                      ? 'text-white font-semibold'
                      : 'text-white/70 hover:text-white/90'
                  }`}
                  aria-label={`Go to slide: ${displayTitle}`}
                >
                  {displayTitle}
                  {index === currentSlide && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white"></div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom Slide Indicators - Mobile (Dots/Lines) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
            <div
              key={currentSlide}
              className="h-full bg-white"
              style={{
                width: '0%',
                animation: 'slideProgress 6s linear forwards'
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
      `}</style>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive solutions for all your security, tracking, and maintenance needs in Ramgarh, Ramgarh Cantt, Hazaribagh, Ranchi, Dhanbad, Bokaro, and across Jharkhand, India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50/50 group-hover:to-transparent transition-all duration-300 rounded-2xl"></div>
                
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <div className="scale-125">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        <div className="flex-shrink-0 mr-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Link */}
                  <Link
                    to="/services"
                    className="inline-flex items-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100/0 to-primary-100/0 group-hover:from-primary-100/30 group-hover:to-transparent rounded-bl-full transition-all duration-300"></div>
              </div>
            ))}
          </div>

          {/* View All Services CTA */}
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>View All Services</span>
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose WAINSO?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We deliver excellence through innovation, reliability, and customer satisfaction. Serving Ramgarh, Ramgarh Cantt, and across Jharkhand, India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Service Areas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serving Ramgarh & Across Jharkhand, India
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide professional security and tracking solutions in multiple cities across Jharkhand and India
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {['Ramgarh', 'Ramgarh Cantt', 'Hazaribagh', 'Ranchi', 'Dhanbad', 'Bokaro', 'Jamshedpur', 'Giridih', 'Deoghar', 'Gumla', 'Chatra', 'Koderma'].map((city) => (
              <div
                key={city}
                className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <MapPin className="h-5 w-5 text-primary-600 mx-auto mb-2" />
                <span className="text-sm font-semibold text-gray-900">{city}</span>
                <span className="block text-xs text-gray-500 mt-1">Jharkhand</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              <span className="font-semibold text-primary-600">+ More cities across India</span> - We also serve major cities nationwide including Delhi, Mumbai, Bangalore, Kolkata, and more.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              <span>Check if we serve your area</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Secure Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get a free consultation and quote for your security and tracking needs in Ramgarh, Ramgarh Cantt, and across Jharkhand, India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote-request"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Get Free Quote
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors backdrop-blur-sm bg-white/10"
            >
              View Products
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
