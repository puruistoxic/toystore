import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Heart, Star, CheckCircle, Shield, MapPin, Image as ImageIcon, ShoppingCart, Play, X } from 'lucide-react';
import { contentApi } from '../utils/api';
import SEO from '../components/SEO';
import {
  buildProductShareDescription,
  generatePageTitle,
  getCanonicalUrl,
  resolveOgImage,
  titleFromProductSlug,
} from '../utils/seo';
import { useProductWhatsApp } from '../contexts/ProductWhatsAppContext';
import { useCart } from '../contexts/CartContext';
import { useAddToListModal } from '../contexts/AddToListModalContext';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';
import {
  isServiceItem,
  PRODUCT_CATEGORY_FILTERS,
  productListingPathForCategory,
  resolveCategoryFilterId,
} from '../utils/productCategoryFilters';
import {
  buildRecommendationSections,
  getTopRecommendedProduct,
  recommendationSectionHasItems,
} from '../utils/productRecommendations';
import QuoteRequestModal from '../components/QuoteRequestModal';
import WhatsAppEnquiryModal from '../components/WhatsAppEnquiryModal';
import ProductRecommendations from '../components/ProductRecommendations';
import ProductDetailQuickNav from '../components/ProductDetailQuickNav';
import { mapDbProductToFrontend } from '../utils/catalogFromDb';
import { parseYoutubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from '../utils/youtube';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const { items } = useCart();
  const { openAddToList } = useAddToListModal();

  // Fetch product from database by slug
  const { data: dbProduct, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await contentApi.getProduct(slug!);
      return response.data;
    },
    enabled: !!slug,
  });

  const product = dbProduct ? mapDbProductToFrontend(dbProduct) : undefined;

  const productInList = useMemo(
    () => Boolean(product && items.some((l) => l.productId === String(product.id))),
    [items, product?.id],
  );

  useEffect(() => {
    setActiveImgIdx(0);
    setOpenVideoId(null);
  }, [product?.id]);

  const { setProductForWhatsApp } = useProductWhatsApp();

  useEffect(() => {
    if (!product) {
      setProductForWhatsApp(null);
      return;
    }
    const pageUrl = getCanonicalUrl(`/products/${product.slug}`);
    setProductForWhatsApp({
      name: product.name,
      slug: product.slug,
      pageUrl,
      brand: product.brand,
    });
    return () => setProductForWhatsApp(null);
  }, [product, setProductForWhatsApp]);

  const breadcrumbCategory = useMemo(() => {
    if (!product) return null;
    const raw = String(product.category || '').trim();
    const id = resolveCategoryFilterId(raw);
    const meta = id ? PRODUCT_CATEGORY_FILTERS.find((c) => c.id === id) : undefined;
    if (meta) {
      return { type: 'link' as const, id: meta.id, label: meta.name };
    }
    if (raw && !/^toys?$/i.test(raw)) {
      return { type: 'text' as const, label: raw };
    }
    return null;
  }, [product]);

  const { data: dbCatalog = [] } = useQuery({
    queryKey: ['products', 'public'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const catalogProducts = useMemo(
    () =>
      (dbCatalog as any[])
        .filter((row) => !isServiceItem(row))
        .map(mapDbProductToFrontend),
    [dbCatalog],
  );

  const recommendationSections = useMemo(() => {
    if (!product) return null;
    return buildRecommendationSections(product, catalogProducts, 4);
  }, [product, catalogProducts]);

  const topRecommendedProduct = useMemo(() => {
    if (!recommendationSections) return null;
    return getTopRecommendedProduct(recommendationSections);
  }, [recommendationSections]);

  const showRecommendationsAnchor = useMemo(
    () => Boolean(recommendationSections && recommendationSectionHasItems(recommendationSections)),
    [recommendationSections],
  );

  const breadcrumbJsonLd = useMemo(() => {
    if (!product) return null;
    const items: { name: string; path?: string }[] = [{ name: 'Products', path: '/products' }];
    if (breadcrumbCategory?.type === 'link') {
      items.push({
        name: breadcrumbCategory.label,
        path: productListingPathForCategory(breadcrumbCategory.id),
      });
    } else if (breadcrumbCategory?.type === 'text') {
      items.push({ name: breadcrumbCategory.label });
    }
    items.push({ name: product.name, path: `/products/${product.slug}` });
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        ...(c.path ? { item: getCanonicalUrl(c.path) } : {}),
      })),
    };
  }, [product, breadcrumbCategory]);

  if (isLoading) {
    const provisionalName = slug ? titleFromProductSlug(slug) : 'Product';
    return (
      <>
        <SEO
          title={generatePageTitle(provisionalName)}
          description={
            slug
              ? `View ${provisionalName} at Khandelwal Toy Store — local toy shop in Surat. Loading full details…`
              : 'Loading product from Khandelwal Toy Store…'
          }
          path={slug ? `/products/${slug}` : '/products'}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO
          title="Product Not Found | Khandelwal Toy Store"
          description="The product you are looking for may have been moved or no longer exists."
          path="/products/not-found"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-6">The product you are looking for may have been moved or no longer exists.</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  const metaDescription = buildProductShareDescription(product);
  const pageTitle = generatePageTitle(product.name);
  const categoryLabelForSeo =
    breadcrumbCategory?.type === 'link' || breadcrumbCategory?.type === 'text'
      ? breadcrumbCategory.label
      : null;
  const schemaCategory =
    categoryLabelForSeo ||
    (String(product.category || '').trim()
      ? String(product.category).replace(/-/g, ' ')
      : undefined);
  const productPageAbsolute = getCanonicalUrl(`/products/${product.slug}`);
  const productShareKeywords = [
    product.name,
    product.brand,
    categoryLabelForSeo,
    product.category,
    product.ageGroup,
    product.materialType,
    ...(product.occasion || []),
    'toys',
    'Khandelwal Toy Store',
    'Surat toy shop',
    'buy toys India',
  ]
    .filter(Boolean)
    .join(', ');

  const productImagesForSchema = (product.images?.length ? product.images : [])
    .map((u) => resolveOgImage(u))
    .filter((u, i, a) => a.indexOf(u) === i);

  const imgs =
    product.images && product.images.length > 0
      ? product.images
      : [getPlaceholderImage(800, 600, product.name)];
  const safeIdx = Math.min(Math.max(0, activeImgIdx), imgs.length - 1);
  const mainDisplayImg = imgs[safeIdx];

  const videoEntries =
    product.videoUrls
      ?.map((url) => {
        const id = parseYoutubeVideoId(url);
        return id ? { id, url } : null;
      })
      .filter((x): x is { id: string; url: string } => x !== null) ?? [];

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription}
        path={`/products/${product.slug}`}
        type="product"
        image={product.images?.[0] ? resolveOgImage(product.images[0]) : undefined}
        imageAlt={`${product.name}${product.brand ? ` (${product.brand})` : ''} — Khandelwal Toy Store`}
        keywords={productShareKeywords}
        productStructuredData={{
          name: product.name,
          description: metaDescription,
          image: productImagesForSchema.length ? productImagesForSchema : [resolveOgImage(product.images?.[0])],
          brand: product.brand || undefined,
          sku: product.sku,
          price: product.price > 0 ? product.price : undefined,
          currency: 'INR',
          productUrl: productPageAbsolute,
          category: schemaCategory,
          inStock: Boolean(product.inStock && product.stockQuantity > 0),
          ...(product.reviews > 0 && product.rating > 0
            ? {
                aggregateRating: {
                  ratingValue: product.rating,
                  reviewCount: product.reviews,
                },
              }
            : {}),
        }}
        additionalJsonLd={breadcrumbJsonLd ? [breadcrumbJsonLd] : undefined}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/products" className="text-gray-500 hover:text-primary-600">
                  Products
                </Link>
              </li>
              {breadcrumbCategory && (
                <>
                  <li className="text-gray-400 select-none" aria-hidden>
                    /
                  </li>
                  <li className="min-w-0 max-w-[min(100%,220px)] sm:max-w-md">
                    {breadcrumbCategory.type === 'link' ? (
                      <Link
                        to={productListingPathForCategory(breadcrumbCategory.id)}
                        className="text-gray-600 hover:text-primary-600 truncate inline-block max-w-full align-bottom"
                      >
                        {breadcrumbCategory.label}
                      </Link>
                    ) : (
                      <span className="text-gray-600 truncate inline-block max-w-full align-bottom">
                        {breadcrumbCategory.label}
                      </span>
                    )}
                  </li>
                </>
              )}
              <li className="text-gray-400 select-none" aria-hidden>
                /
              </li>
              <li className="text-gray-900 font-medium min-w-0 flex-1 sm:flex-none">
                <span className="line-clamp-2 sm:line-clamp-none sm:truncate sm:max-w-xl lg:max-w-2xl inline-block">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="aspect-w-16 aspect-h-12 min-h-[280px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {mainDisplayImg ? (
                  <img
                    src={mainDisplayImg}
                    alt={product.name}
                    className="h-full w-full object-cover min-h-[280px]"
                    onError={(e) => handleImageError(e, product.name)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mb-2" />
                    <p className="text-sm">{product.name}</p>
                  </div>
                )}
              </div>
            </div>
            {imgs.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imgs.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImgIdx(index)}
                    className={`bg-white rounded-lg p-2 ring-2 ring-offset-1 transition-shadow ${
                      safeIdx === index ? 'ring-teal-500' : 'ring-transparent hover:ring-gray-300'
                    }`}
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => handleImageError(e, product.name)}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {videoEntries.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Videos</h3>
                <div className="flex flex-wrap gap-3">
                  {videoEntries.map(({ id }, idx) => (
                    <button
                      key={`${id}-${idx}`}
                      type="button"
                      onClick={() => setOpenVideoId(id)}
                      className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-gray-900 group focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <img
                        src={youtubeThumbnailUrl(id)}
                        alt=""
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40">
                        <span className="rounded-full bg-white/95 p-2.5 shadow-md">
                          <Play className="h-6 w-6 text-red-600 fill-current" />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-500">{product.brand}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.model}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {product.price > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-600 tabular-nums">
                      ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    {product.priceIncludesGst && (
                      <span className="text-sm text-gray-500">(incl. GST)</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xl font-semibold text-gray-800">Price on request</p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  {product.price > 0
                    ? 'Indicative website price — confirm on WhatsApp or at the store.'
                    : 'Ask us on WhatsApp or visit the store for the latest price and offers.'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Location Badge (only for CCTV/Security categories) */}
            {(product.category === 'security' || product.category === 'cctv') && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                  <MapPin className="h-4 w-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span className="font-medium">Available in Ramgarh, Jharkhand</span>
                </div>
              </div>
            )}

            {/* Toy-specific + price/stock summary */}
            {(product.ageGroup ||
              product.occasion?.length ||
              (product.gender && product.gender !== 'all') ||
              product.materialType ||
              product.educationalValue ||
              product.price > 0 ||
              product.stockQuantity !== undefined) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h3>
                {product.ageGroup && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24">Age Group:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{product.ageGroup}</span>
                  </div>
                )}
                {product.gender && product.gender !== 'all' && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24">Gender:</span>
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium capitalize">{product.gender}</span>
                  </div>
                )}
                {product.occasion && product.occasion.length > 0 && (
                  <div className="flex items-start text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24 mt-1">Occasion:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.occasion.map((occ, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium capitalize">
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.materialType && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24">Material:</span>
                    <span className="text-gray-600">{product.materialType}</span>
                  </div>
                )}
                {product.educationalValue && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24">Type:</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Educational</span>
                  </div>
                )}
                {product.stockQuantity !== undefined && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium text-gray-900 w-24">Stock:</span>
                    <span className={product.stockQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-medium text-gray-900 w-24">Price:</span>
                  {product.price > 0 ? (
                    <span className="text-primary-700 font-semibold tabular-nums">
                      ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      {product.priceIncludesGst ? ' (incl. GST)' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-600">On request — WhatsApp or store</span>
                  )}
                </div>
              </div>
            )}

            <ProductDetailQuickNav
              recommendedProduct={topRecommendedProduct}
              showRecommendationsAnchor={showRecommendationsAnchor}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(true)}
                className="flex-1 min-w-[160px] px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20BA5A] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Inquiry
              </button>
              <button
                type="button"
                onClick={() => openAddToList(product)}
                className={`min-w-[140px] px-5 py-3 rounded-lg font-semibold border-2 transition-colors flex items-center justify-center gap-2 ${
                  productInList
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50'
                }`}
                aria-label={
                  productInList
                    ? 'Product is in your order list. Click to add another.'
                    : 'Add to order list'
                }
              >
                <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden />
                {productInList ? 'In your list' : 'Add to list'}
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 font-medium">{key}:</dt>
                        <dd className="text-gray-900">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Warranty */}
            {product.warranty && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">{product.warranty}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {recommendationSections && recommendationSectionHasItems(recommendationSections) && (
          <ProductRecommendations sections={recommendationSections} />
        )}
      </div>

      {/* Quote Request Modal */}
      {product && (
        <>
          <QuoteRequestModal
            isOpen={quoteModalOpen}
            onClose={() => setQuoteModalOpen(false)}
            product={product}
            productId={product.id.toString()}
          />
          <WhatsAppEnquiryModal
            isOpen={whatsappModalOpen}
            onClose={() => setWhatsappModalOpen(false)}
            product={product}
          />
        </>
      )}
    </div>

    {openVideoId && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
        onClick={() => setOpenVideoId(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Video"
      >
        <div
          className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setOpenVideoId(null)}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 text-white p-2 hover:bg-black/80"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="aspect-video w-full">
            <iframe
              title="YouTube video"
              src={youtubeEmbedUrl(openVideoId)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ProductDetail;
