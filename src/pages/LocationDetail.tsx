import React from 'react';
import { useParams } from 'react-router-dom';
import GenericDetailTemplate from '../components/templates/GenericDetailTemplate';
import { locations } from '../data/locations';
import { services } from '../data/services';
import { products } from '../data/products';
import { testimonials } from '../data/testimonials';
import { caseStudies } from '../data/caseStudies';
import { Location } from '../types/content';
import { MapPin, CheckCircle } from 'lucide-react';

const LocationDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = locations.find((loc) => loc.slug === slug) as Location | undefined;

  // Get related items
  const relatedServices = location
    ? services.filter((s) => location.services.includes(s.id))
    : [];
  const relatedProducts = location
    ? products.filter((p) => location.products.includes(p.id))
    : [];
  const relatedTestimonials = location
    ? testimonials.filter((t) => t.location === location.id).slice(0, 3)
    : [];
  const relatedCaseStudies = location
    ? caseStudies.filter((cs) => cs.location === location.id).slice(0, 2)
    : [];

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Service Areas', path: '/locations' },
    { label: location?.name || 'Location', path: `/locations/${slug}` }
  ];

  const renderCustomSections = (data: any) => (
    <>
      {/* Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-primary-600" />
            Location Details
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">City:</span> {data.name}</p>
            <p><span className="font-semibold">State:</span> {data.state}</p>
            <p><span className="font-semibold">Country:</span> {data.country}</p>
          </div>
        </div>

        {data.stats && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-primary-600" />
              Our Track Record
            </h3>
            <div className="space-y-2 text-gray-700">
              {data.stats.projectsCompleted && (
                <p><span className="font-semibold">Projects Completed:</span> {data.stats.projectsCompleted}+</p>
              )}
              {data.stats.customersServed && (
                <p><span className="font-semibold">Customers Served:</span> {data.stats.customersServed}+</p>
              )}
              {data.stats.yearsActive && (
                <p><span className="font-semibold">Years Active:</span> {data.stats.yearsActive}+</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Coverage Areas */}
      {data.coverageAreas && data.coverageAreas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Coverage Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.coverageAreas.map((area: string, index: number) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <MapPin className="h-5 w-5 text-primary-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Landmarks */}
      {data.landmarks && data.landmarks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Landmarks Served</h2>
          <div className="flex flex-wrap gap-3">
            {data.landmarks.map((landmark: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
              >
                {landmark}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Convert Location to ContentItem format
  const locationAsContentItem = location ? {
    ...location,
    title: location.name, // Map name to title for template
    name: location.name
  } : undefined;

  return (
    <GenericDetailTemplate
      data={locationAsContentItem}
      type="location"
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

export default LocationDetail;

