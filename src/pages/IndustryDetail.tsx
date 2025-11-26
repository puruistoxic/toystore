import React from 'react';
import { useParams } from 'react-router-dom';
import GenericDetailTemplate from '../components/templates/GenericDetailTemplate';
import { industries } from '../data/industries';
import { services } from '../data/services';
import { products } from '../data/products';
import { testimonials } from '../data/testimonials';
import { caseStudies } from '../data/caseStudies';
import { Industry } from '../types/content';
import { Building, Target, TrendingUp } from 'lucide-react';

const IndustryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const industry = industries.find((i) => i.slug === slug) as Industry | undefined;

  const relatedServices = industry
    ? services.filter((s) => industry.services.includes(s.id))
    : [];
  const relatedProducts = industry
    ? products.filter((p) => industry.products.includes(p.id))
    : [];
  const relatedTestimonials = industry
    ? testimonials.filter((t) => t.industry === industry.id).slice(0, 3)
    : [];
  const relatedCaseStudies = industry
    ? caseStudies.filter((cs) => cs.industry === industry.id).slice(0, 2)
    : [];

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Industries', path: '/industries' },
    { label: industry?.name || 'Industry', path: `/industries/${slug}` }
  ];

  const renderCustomSections = (data: any) => (
    <>
      {/* Use Cases */}
      {data.useCases && data.useCases.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.useCases.map((useCase: { title: string; description: string; image?: string }, index: number) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                {useCase.image && (
                  <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {data.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {data.stats.clientsServed && (
            <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
              <div className="flex items-center mb-2">
                <Building className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Clients Served</h3>
              </div>
              <p className="text-3xl font-bold text-primary-600">{data.stats.clientsServed}+</p>
            </div>
          )}
          {data.stats.projectsCompleted && (
            <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
              <div className="flex items-center mb-2">
                <Target className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Projects Completed</h3>
              </div>
              <p className="text-3xl font-bold text-primary-600">{data.stats.projectsCompleted}+</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  // Convert Industry to ContentItem format
  const industryAsContentItem = industry ? {
    ...industry,
    title: industry.name, // Map name to title for template
    name: industry.name
  } : undefined;

  return (
    <GenericDetailTemplate
      data={industryAsContentItem}
      type="industry"
      relatedItems={{
        services: relatedServices.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
        products: relatedProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
        testimonials: relatedTestimonials.map((t) => ({
          id: t.id,
          name: t.name,
          review: t.review,
          rating: t.rating
        })),
        caseStudies: relatedCaseStudies.map((cs) => ({
          id: cs.id,
          title: cs.title,
          slug: cs.slug
        }))
      }}
      breadcrumbs={breadcrumbs}
      renderCustomSections={renderCustomSections}
    />
  );
};

export default IndustryDetail;

