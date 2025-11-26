import React from 'react';
import { useParams } from 'react-router-dom';
import GenericDetailTemplate from '../components/templates/GenericDetailTemplate';
import { brands } from '../data/brands';
import { services } from '../data/services';
import { products } from '../data/products';
import { Brand } from '../types/content';
import { Building, Award, ExternalLink, Shield, CheckCircle } from 'lucide-react';

const BrandDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const brand = brands.find((b) => b.slug === slug) as Brand | undefined;

  const relatedServices = brand
    ? services.filter((s) => brand.services.includes(s.id))
    : [];
  const relatedProducts = brand
    ? products.filter((p) => brand.products.includes(p.id))
    : [];

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Brands', path: '/brands' },
    { label: brand?.name || 'Brand', path: `/brands/${slug}` }
  ];

  const renderCustomSections = (data: any) => (
    <>
      {/* Brand Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Building className="h-6 w-6 mr-2 text-primary-600" />
            Partnership Details
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Partnership Type:</span> {data.partnershipType.replace('-', ' ')}</p>
            {data.partnershipSince && (
              <p><span className="font-semibold">Partner Since:</span> {data.partnershipSince}</p>
            )}
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-2"
              >
                Visit Website <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            )}
          </div>
        </div>

        {data.certifications && data.certifications.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-primary-600" />
              Certifications
            </h3>
            <ul className="space-y-2">
              {data.certifications.map((cert: string, index: number) => (
                <li key={index} className="flex items-center text-gray-700">
                  <Shield className="h-4 w-4 mr-2 text-primary-600" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Features */}
      {data.features && data.features.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.features.map((feature: string, index: number) => (
              <div
                key={index}
                className="flex items-start bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <CheckCircle className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warranty & Support */}
      {(data.warranty || data.support) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {data.warranty && (
            <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Warranty</h3>
              <p className="text-gray-700">{data.warranty}</p>
            </div>
          )}
          {data.support && (
            <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-700">{data.support}</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  // Convert Brand to ContentItem format
  const brandAsContentItem = brand ? {
    ...brand,
    title: brand.name, // Map name to title for template
    name: brand.name
  } : undefined;

  return (
    <GenericDetailTemplate
      data={brandAsContentItem}
      type="brand"
      relatedItems={{
        services: relatedServices.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
        products: relatedProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))
      }}
      breadcrumbs={breadcrumbs}
      renderCustomSections={renderCustomSections}
    />
  );
};

export default BrandDetail;

