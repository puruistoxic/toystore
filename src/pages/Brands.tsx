import React from 'react';
import GenericListingTemplate from '../components/templates/GenericListingTemplate';
import { brands } from '../data/brands';

const Brands: React.FC = () => {
  return (
    <GenericListingTemplate
      items={brands as any[]}
      type="brand"
      title="Our Brands & Partners"
      description="We are authorized dealers and partners for leading security and tracking brands. Quality products with warranty and professional support."
      searchPlaceholder="Search brands..."
      filterOptions={[
        {
          id: 'cctv',
          label: 'CCTV',
          filter: (item: any) => item.category === 'cctv'
        },
        {
          id: 'gps',
          label: 'GPS',
          filter: (item: any) => item.category === 'gps'
        },
        {
          id: 'security',
          label: 'Security',
          filter: (item: any) => item.category === 'security'
        }
      ]}
      getItemPath={(item) => `/brands/${item.slug}`}
      renderCard={(item) => (
        <div className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group">
          {item.localLogo && (
            <div className="relative h-48 bg-gray-50 flex items-center justify-center p-8">
              <img
                src={item.localLogo}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (item.logoUrl) {
                    target.src = item.logoUrl;
                  } else {
                    target.src = '/api/placeholder/400/200';
                  }
                }}
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {item.shortDescription || item.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {item.partnershipType.replace('-', ' ')}
              </span>
              <span className="text-primary-600 font-semibold text-sm group-hover:underline">
                Learn more →
              </span>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default Brands;




