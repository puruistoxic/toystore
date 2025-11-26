import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Star, CheckCircle, ExternalLink } from 'lucide-react';
import SEO from '../SEO';
import { ContentItem } from '../../types/content';

interface GenericDetailTemplateProps<T extends ContentItem = ContentItem> {
  data: T | undefined;
  type: 'location' | 'brand' | 'industry' | 'category';
  relatedItems?: {
    services?: Array<{ id: string; name: string; slug: string }>;
    products?: Array<{ id: string; name: string; slug: string }>;
    testimonials?: Array<{ id: string; name: string; review: string; rating: number }>;
    caseStudies?: Array<{ id: string; title: string; slug: string }>;
  };
  breadcrumbs?: Array<{ label: string; path: string }>;
  renderCustomSections?: (data: T) => React.ReactNode;
}

const GenericDetailTemplate = <T extends ContentItem = ContentItem>({
  data,
  type,
  relatedItems,
  breadcrumbs,
  renderCustomSections
}: GenericDetailTemplateProps<T>) => {
  if (!data) {
    return (
      <>
        <SEO
          title={`${type.charAt(0).toUpperCase() + type.slice(1)} Not Found | WAINSO`}
          description={`The ${type} you are looking for may have been moved or no longer exists.`}
          path={`/${type}s/not-found`}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {type.charAt(0).toUpperCase() + type.slice(1)} Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The {type} you are looking for may have been moved or no longer exists.
            </p>
            <Link
              to={`/${type}s`}
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to {type.charAt(0).toUpperCase() + type.slice(1)}s
            </Link>
          </div>
        </div>
      </>
    );
  }

  const displayTitle = data.title || data.name || 'Untitled';
  const pageTitle = data.seo?.title || `${displayTitle} | WAINSO`;
  const metaDescription = data.seo?.description || data.description;

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription}
        path={`/${type}s/${data.slug}`}
      />

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <Link
                    to={crumb.path}
                    className={`${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/${type}s`}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {type.charAt(0).toUpperCase() + type.slice(1)}s
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{displayTitle}</h1>
              {data.shortDescription && (
                <p className="text-xl text-white/90 mb-6">{data.shortDescription}</p>
              )}
              <div className="flex flex-wrap gap-4">
                {data.stats && (
                  <>
                    {data.stats.projectsCompleted && (
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>{data.stats.projectsCompleted}+ Projects</span>
                      </div>
                    )}
                    {data.stats.customersServed && (
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>{data.stats.customersServed}+ Customers</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {data.image && (
              <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={data.image}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/800/600';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed mb-8">{data.description}</p>
          </div>

          {/* Custom Sections */}
          {renderCustomSections && renderCustomSections(data)}

          {/* Related Services */}
          {relatedItems?.services && relatedItems.services.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedItems.services.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.slug}`}
                    className="block bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <span className="text-primary-600 text-sm font-medium">Learn more →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedItems?.products && relatedItems.products.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedItems.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="block bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <span className="text-primary-600 text-sm font-medium">View product →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {relatedItems?.testimonials && relatedItems.testimonials.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedItems.testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.review}"</p>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case Studies */}
          {relatedItems?.caseStudies && relatedItems.caseStudies.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Case Studies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedItems.caseStudies.map((caseStudy) => (
                  <Link
                    key={caseStudy.id}
                    to={`/case-studies/${caseStudy.slug}`}
                    className="block bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseStudy.title}</h3>
                    <span className="text-primary-600 text-sm font-medium">Read case study →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us today for a free consultation and quote
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote-request"
              className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default GenericDetailTemplate;

