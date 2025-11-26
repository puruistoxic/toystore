import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle, Target, Award } from 'lucide-react';
import SEO from '../components/SEO';
import { caseStudies } from '../data/caseStudies';
import { locations } from '../data/locations';
import { industries } from '../data/industries';
import { services } from '../data/services';
import { products } from '../data/products';
import { brands } from '../data/brands';
import { testimonials } from '../data/testimonials';
import { CaseStudy } from '../types/content';

const CaseStudyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const caseStudy = caseStudies.find((cs) => cs.slug === slug) as CaseStudy | undefined;

  if (!caseStudy) {
    return (
      <>
        <SEO
          title="Case Study Not Found | WAINSO"
          description="The case study you are looking for may have been moved or no longer exists."
          path="/case-studies/not-found"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Case Study Not Found</h1>
            <p className="text-gray-600 mb-8">
              The case study you are looking for may have been moved or no longer exists.
            </p>
            <Link
              to="/case-studies"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Case Studies
            </Link>
          </div>
        </div>
      </>
    );
  }

  const location = locations.find((l) => l.id === caseStudy.location);
  const industry = industries.find((i) => i.id === caseStudy.industry);
  const brand = caseStudy.brand ? brands.find((b) => b.id === caseStudy.brand) : undefined;
  const relatedServices = services.filter((s) => caseStudy.services.includes(s.id));
  const relatedProducts = products.filter((p) => caseStudy.products.includes(p.id));
  const testimonial = caseStudy.testimonial
    ? testimonials.find((t) => t.id === caseStudy.testimonial)
    : undefined;

  return (
    <>
      <SEO
        title={caseStudy.seo.title}
        description={caseStudy.seo.description}
        path={`/case-studies/${caseStudy.slug}`}
      />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/case-studies" className="text-gray-600 hover:text-primary-600">Case Studies</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{caseStudy.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/case-studies"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Case Studies
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {industry && (
                  <Link
                    to={`/industries/${industry.slug}`}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    {industry.name}
                  </Link>
                )}
                {location && (
                  <Link
                    to={`/locations/${location.slug}`}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    {location.name}
                  </Link>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{caseStudy.title}</h1>
              <p className="text-xl text-white/90 mb-6">{caseStudy.shortDescription}</p>
              {caseStudy.client && (
                <div className="flex items-center">
                  <span className="text-white/80 mr-2">Client:</span>
                  <span className="font-semibold">{caseStudy.client.name}</span>
                </div>
              )}
            </div>
            {caseStudy.images && caseStudy.images.length > 0 && (
              <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={caseStudy.images[0]}
                  alt={caseStudy.title}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Challenge */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Challenge</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{caseStudy.challenge}</p>
          </div>

          {/* Solution */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{caseStudy.solution}</p>
          </div>

          {/* Results */}
          {caseStudy.results && caseStudy.results.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {caseStudy.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-primary-50 rounded-lg p-6 border border-primary-200 text-center"
                  >
                    <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-primary-600 mb-2">{result.value}</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">{result.metric}</div>
                    {result.improvement && (
                      <div className="text-xs text-gray-500">{result.improvement}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services & Products Used */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {relatedServices.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Services Used</h3>
                <div className="space-y-2">
                  {relatedServices.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${service.slug}`}
                      className="block text-primary-600 hover:text-primary-700"
                    >
                      → {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedProducts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Products Used</h3>
                <div className="space-y-2">
                  {relatedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="block text-primary-600 hover:text-primary-700"
                    >
                      → {product.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Testimonial */}
          {testimonial && (
            <div className="bg-gray-50 rounded-lg p-8 mb-12 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Award
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-4 italic">"{testimonial.review}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                {testimonial.role && testimonial.company && (
                  <p className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {caseStudy.images && caseStudy.images.length > 1 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${caseStudy.title} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/600/400';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Similar Results?</h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us today to discuss your security and tracking needs
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

export default CaseStudyDetail;

