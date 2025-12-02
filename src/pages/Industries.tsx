import React from 'react';
import GenericListingTemplate from '../components/templates/GenericListingTemplate';
import { industries } from '../data/industries';

const Industries: React.FC = () => {
  return (
    <GenericListingTemplate
      items={industries as any[]}
      type="industry"
      title="Industries We Serve"
      description="We provide specialized security and tracking solutions for various industries. From retail to manufacturing, healthcare to education, we have the expertise to secure your business."
      searchPlaceholder="Search industries..."
      getItemPath={(item) => `/industries/${item.slug}`}
    />
  );
};

export default Industries;




