import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_ORIGIN,
  getCanonicalUrl,
  generatePageTitle,
  resolveOgImage,
} from '../utils/seo';

interface ProductStructuredData {
  name: string;
  description: string;
  image: string[];
  brand?: string;
  sku?: string;
  price?: number;
  currency?: string;
  /** Product detail page URL (absolute) */
  productUrl?: string;
  /** Display category for schema.org */
  category?: string;
  /** Drives Offer availability + og:product:availability */
  inStock?: boolean;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  /** Shown as og:image:alt / twitter:image:alt — helps accessibility & some crawlers */
  imageAlt?: string;
  keywords?: string;
  /** Overrides default robots; e.g. `noindex, nofollow` for 404 */
  robots?: string;
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
  /** Product page — adds Product JSON-LD and optional product:* Open Graph hints */
  productStructuredData?: ProductStructuredData;
  /** Extra JSON-LD objects (e.g. BreadcrumbList) */
  additionalJsonLd?: Record<string, unknown>[];
}

const DEFAULT_DESCRIPTION =
  'Khandelwal Toy Store — your local toy shop for kids’ toys, games, and gifts. Browse the catalogue, visit the store, or message us for availability and friendly advice.';

const DEFAULT_TITLE = `${SITE_NAME} | Neighbourhood toy shop`;

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ToyStore',
  name: SITE_NAME,
  url: SITE_ORIGIN,
  description:
    'Neighbourhood toy shop offering quality toys, games, and gifts for children. Visit in person or contact us on WhatsApp.',
  telephone: '+91-99114-84404',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Surat',
    addressRegion: 'Gujarat',
    postalCode: '395006',
    addressCountry: 'IN',
  },
};

const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  imageAlt,
  keywords = DEFAULT_KEYWORDS,
  robots,
  type = 'website',
  serviceSchema,
  productStructuredData,
  additionalJsonLd,
}) => {
  const canonicalUrl = getCanonicalUrl(path);
  const fullTitle = title.includes('|') ? title : generatePageTitle(title.replace(/\s*\|\s*Khandelwal Toy Store\s*$/i, ''));
  const ogImage = resolveOgImage(image);
  const ogImageAlt = imageAlt || (productStructuredData?.name ? `${productStructuredData.name} — ${SITE_NAME}` : `${SITE_NAME} — toys and gifts`);

  const facebookAppId = typeof process !== 'undefined' ? process.env.REACT_APP_FACEBOOK_APP_ID : undefined;
  const twitterHandle = typeof process !== 'undefined' ? process.env.REACT_APP_TWITTER_SITE : undefined;

  const generatePrimarySchema = () => {
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
          address: serviceSchema.provider.address
            ? {
                '@type': 'PostalAddress',
                addressLocality: serviceSchema.provider.address.addressLocality,
                addressRegion: serviceSchema.provider.address.addressRegion,
                addressCountry: serviceSchema.provider.address.addressCountry,
              }
            : undefined,
          areaServed: serviceSchema.areaServed?.map((area) => ({
            '@type': 'City',
            name: area.name,
          })),
        },
        offers: {
          '@type': 'Offer',
          price: serviceSchema.price,
          priceCurrency: serviceSchema.priceCurrency || 'INR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: serviceSchema.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: serviceSchema.rating.value,
              reviewCount: serviceSchema.rating.count,
            }
          : undefined,
      };
    }

    if (productStructuredData) {
      const {
        name,
        desc,
        img,
        brand,
        sku,
        price,
        currency,
        productUrl,
        category,
        inStock,
        aggregateRating,
      } = {
        name: productStructuredData.name,
        desc: productStructuredData.description,
        img: productStructuredData.image.filter(Boolean),
        brand: productStructuredData.brand,
        sku: productStructuredData.sku,
        price: productStructuredData.price,
        currency: productStructuredData.currency || 'INR',
        productUrl: productStructuredData.productUrl,
        category: productStructuredData.category,
        inStock: productStructuredData.inStock !== false,
        aggregateRating: productStructuredData.aggregateRating,
      };
      const availabilityUrl =
        inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
      const offer =
        price != null && price > 0
          ? {
              '@type': 'Offer',
              priceCurrency: currency,
              price: String(price),
              availability: availabilityUrl,
              url: productUrl || canonicalUrl,
            }
          : {
              '@type': 'Offer',
              priceCurrency: currency,
              availability: availabilityUrl,
              url: productUrl || canonicalUrl,
            };

      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description: desc,
        image: img.length ? img : [ogImage],
        url: productUrl || canonicalUrl,
        sku: sku || undefined,
        category: category || undefined,
        brand: brand
          ? {
              '@type': 'Brand',
              name: brand,
            }
          : undefined,
        offers: offer,
        aggregateRating:
          aggregateRating && aggregateRating.reviewCount > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: aggregateRating.ratingValue,
                reviewCount: aggregateRating.reviewCount,
              }
            : undefined,
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      description,
      url: SITE_ORIGIN,
    };
  };

  const primarySchema = generatePrimarySchema();

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {robots ? <meta name="robots" content={robots} /> : null}

      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — Facebook, WhatsApp, LinkedIn, Instagram (link previews) */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={productStructuredData ? 'product' : type === 'service' ? 'website' : type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:url" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />

      {productStructuredData && productStructuredData.price != null && productStructuredData.price > 0 ? (
        <>
          <meta property="product:price:amount" content={String(productStructuredData.price)} />
          <meta property="product:price:currency" content={productStructuredData.currency || 'INR'} />
        </>
      ) : null}

      {productStructuredData?.brand ? (
        <meta property="product:brand" content={productStructuredData.brand} />
      ) : null}
      {productStructuredData ? (
        <meta
          property="product:availability"
          content={productStructuredData.inStock !== false ? 'in stock' : 'out of stock'}
        />
      ) : null}
      {productStructuredData?.sku ? (
        <meta property="product:retailer_item_id" content={productStructuredData.sku} />
      ) : null}

      {facebookAppId ? <meta property="fb:app_id" content={facebookAppId} /> : null}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      {twitterHandle ? <meta name="twitter:site" content={twitterHandle} /> : null}
      {twitterHandle ? <meta name="twitter:creator" content={twitterHandle} /> : null}

      <script type="application/ld+json">{JSON.stringify(primarySchema, null, 0)}</script>
      {additionalJsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj, null, 0)}
        </script>
      ))}
      {!serviceSchema ? (
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd, null, 0)}</script>
      ) : null}
    </Helmet>
  );
};

export default SEO;
