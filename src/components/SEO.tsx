import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getCanonicalUrl, generatePageTitle, generateServiceMetaDescription } from '../utils/seo';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  serviceSchema?: {
    name: string;
    description: string;
    price: number;
    priceCurrency?: string;
    provider: {
      name: string;
      telephone: string;
      email: string;
      address?: {
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
      };
    };
    areaServed?: Array<{
      name: string;
    }>;
    rating?: {
      value: number;
      count: number;
    };
  };
}

const SEO: React.FC<SEOProps> = ({
  title = 'WAINSO - IT, ERP, Security & Networking Solutions',
  description = 'Full-stack IT partner for ERP, networking, security, and software solutions with nationwide delivery and support.',
  path = '/',
  image = 'https://wainso.com/images/og-image.jpg',
  type = 'website',
  serviceSchema
}) => {
  const canonicalUrl = getCanonicalUrl(path);
  const fullTitle = title.includes('|') ? title : generatePageTitle(title);

  // Generate Schema.org structured data
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type === 'service' ? 'Service' : type === 'product' ? 'Product' : 'WebSite',
      name: title,
      description: description,
      url: canonicalUrl
    };

    if (serviceSchema) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceSchema.name,
        description: serviceSchema.description,
        provider: {
          '@type': 'LocalBusiness',
          name: serviceSchema.provider.name,
          telephone: serviceSchema.provider.telephone,
          email: serviceSchema.provider.email,
          address: serviceSchema.provider.address ? {
            '@type': 'PostalAddress',
            addressLocality: serviceSchema.provider.address.addressLocality,
            addressRegion: serviceSchema.provider.address.addressRegion,
            addressCountry: serviceSchema.provider.address.addressCountry
          } : undefined,
          areaServed: serviceSchema.areaServed?.map(area => ({
            '@type': 'City',
            name: area.name
          }))
        },
        offers: {
          '@type': 'Offer',
          price: serviceSchema.price,
          priceCurrency: serviceSchema.priceCurrency || 'INR',
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: serviceSchema.rating ? {
          '@type': 'AggregateRating',
          ratingValue: serviceSchema.rating.value,
          reviewCount: serviceSchema.rating.count
        } : undefined
      };
    }

    return baseSchema;
  };

  const schema = generateSchema();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="WAINSO" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Keywords */}
      <meta name="keywords" content="ERP development, IT services, networking solutions, hardware procurement, CCTV installation, managed IT AMC, software development, cloud and servers, pan India IT partner" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>

      {/* Additional Schema for LocalBusiness */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'WAINSO',
          description: 'Professional CCTV installation, GPS tracking, and maintenance services',
          telephone: '+919899860975',
          email: 'wainsogps@gmail.com',
          address: undefined,
          geo: undefined,
          areaServed: undefined,
          url: 'https://wainso.com',
          priceRange: '₹₹',
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '18:00'
          }
        }, null, 2)}
      </script>
    </Helmet>
  );
};

export default SEO;

