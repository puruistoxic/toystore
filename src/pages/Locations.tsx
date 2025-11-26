import React from 'react';
import GenericListingTemplate from '../components/templates/GenericListingTemplate';
import { locations } from '../data/locations';
import { Location } from '../types/content';

const Locations: React.FC = () => {
  return (
    <GenericListingTemplate
      items={locations as any[]}
      type="location"
      title="Our Service Areas"
      description="We provide professional security and tracking solutions across multiple cities in Jharkhand and India. Find services in your area."
      searchPlaceholder="Search locations..."
      filterOptions={[
        {
          id: 'jharkhand',
          label: 'Jharkhand',
          filter: (item: any) => item.state === 'Jharkhand'
        }
      ]}
      getItemPath={(item) => `/locations/${item.slug}`}
    />
  );
};

export default Locations;

