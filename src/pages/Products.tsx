import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { contentApi } from '../utils/api';
import type { Product } from '../types/catalog';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { hybridSearch } from '../utils/fuzzySearch';
import {
  isServiceItem,
  KNOWN_PRODUCT_CATEGORY_IDS,
  PRODUCT_CATEGORY_FILTERS,
  productListingPathForCategory,
  resolveCategoryFilterId,
} from '../utils/productCategoryFilters';
import { DEFAULT_KEYWORDS, generatePageTitle } from '../utils/seo';
import { mapDbProductToFrontend as catalogMapProduct } from '../utils/catalogFromDb';

function mapDbProductToFrontend(dbProduct: any): Product {
  const base = catalogMapProduct(dbProduct);
  const resolvedCategory =
    resolveCategoryFilterId(String(dbProduct.category || '')) ||
    (dbProduct.category && String(dbProduct.category).trim() ? String(dbProduct.category).trim() : null);
  return {
    ...base,
    category: resolvedCategory || base.category || 'toys',
  };
}

const Products: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const activeCategoryId = useMemo((): 'all' | string => {
    if (categorySlug) {
      const id = resolveCategoryFilterId(categorySlug);
      if (id && KNOWN_PRODUCT_CATEGORY_IDS.has(id)) return id;
      return 'all';
    }
    const q = searchParams.get('category');
    if (q) {
      const id = resolveCategoryFilterId(q);
      if (id && KNOWN_PRODUCT_CATEGORY_IDS.has(id)) return id;
    }
    return 'all';
  }, [categorySlug, searchParams]);

  useEffect(() => {
    if (categorySlug) return;
    const q = searchParams.get('category');
    if (!q) return;
    const id = resolveCategoryFilterId(q);
    if (id && KNOWN_PRODUCT_CATEGORY_IDS.has(id)) {
      navigate(productListingPathForCategory(id), { replace: true });
    } else {
      navigate('/products', { replace: true });
    }
  }, [categorySlug, searchParams, navigate]);

  useEffect(() => {
    if (!categorySlug) return;
    const id = resolveCategoryFilterId(categorySlug);
    if (!id || !KNOWN_PRODUCT_CATEGORY_IDS.has(id)) {
      navigate('/products', { replace: true });
    }
  }, [categorySlug, navigate]);

  // Fetch products from database
  const { data: dbProducts = [], isLoading, error } = useQuery({
    queryKey: ['products', 'public'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map database products to frontend format and filter out services
  const products = useMemo(() => {
    return dbProducts
      .filter((dbProduct: any) => !isServiceItem(dbProduct)) // Filter out services
      .map(mapDbProductToFrontend);
  }, [dbProducts]);

  const visibleCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of products) {
      const id = resolveCategoryFilterId(p.category);
      if (id) ids.add(id);
    }
    return ids;
  }, [products]);

  const categories = useMemo(() => {
    const listed = PRODUCT_CATEGORY_FILTERS.filter(
      (c) => visibleCategoryIds.has(c.id) || c.id === activeCategoryId,
    ).map((c) => ({
      id: c.id,
      name: c.name,
    }));
    return [{ id: 'all', name: 'All Products' }, ...listed];
  }, [visibleCategoryIds, activeCategoryId]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: Product) => {
      if (activeCategoryId === 'all') return true;
      const pid = resolveCategoryFilterId(product.category);
      return pid === activeCategoryId;
    });
    
    // Then apply smart fuzzy search
    if (searchTerm) {
      const searchFields: (keyof Product)[] = ['name', 'description', 'category', 'brand', 'model'];
      filtered = hybridSearch(filtered, searchTerm, searchFields);
    }
    
    return filtered;
  }, [products, activeCategoryId, searchTerm]);

  const categorySeoMeta = useMemo(() => {
    if (activeCategoryId === 'all') return null;
    return PRODUCT_CATEGORY_FILTERS.find((c) => c.id === activeCategoryId) ?? null;
  }, [activeCategoryId]);

  const seoPath =
    activeCategoryId === 'all' ? '/products' : productListingPathForCategory(activeCategoryId);
  const seoTitle =
    categorySeoMeta != null
      ? generatePageTitle(`Shop ${categorySeoMeta.name}`)
      : 'Shop toys online catalogue | Khandelwal Toy Store';
  const seoDescription =
    categorySeoMeta != null
      ? `Browse ${categorySeoMeta.name} at Khandelwal Toy Store — local toy shop. Visit us or message for stock and price.`
      : 'Browse our toy catalogue — action figures, learning toys, board games, RC toys, dolls, and more. Visit the store or enquire on WhatsApp for availability and price.';

  const seoKeywords =
    categorySeoMeta != null
      ? `${categorySeoMeta.name}, ${categorySeoMeta.name} toys, toy shop, Khandelwal Toy Store, kids toys, India`
      : DEFAULT_KEYWORDS;

  const hasActiveFilters = activeCategoryId !== 'all' || Boolean(searchTerm.trim());
  const activeCategoryLabel =
    activeCategoryId === 'all'
      ? 'All products'
      : categories.find((c) => c.id === activeCategoryId)?.name ?? 'Category';

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} path={seoPath} keywords={seoKeywords} />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">Our Products</h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
              Toys for kids of all ages — browse here, then visit us or message for stock and details.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        {/* Mobile: show / hide sidebar */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen((o) => !o)}
          className="lg:hidden w-full flex items-center justify-between gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 shadow-sm text-left mb-4 active:bg-gray-50 transition-colors"
          aria-expanded={mobileSidebarOpen}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 shrink-0">
              <SlidersHorizontal className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-gray-900">Search &amp; categories</span>
              <span className="block text-xs text-gray-500 truncate">
                {activeCategoryLabel}
                {searchTerm.trim()
                  ? ` · “${searchTerm.trim().slice(0, 28)}${searchTerm.trim().length > 28 ? '…' : ''}”`
                  : ''}
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 shrink-0 transition-transform ${mobileSidebarOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left sidebar — search, categories, shortcuts */}
          <aside
            className={`
              lg:col-span-4 xl:col-span-3
              ${mobileSidebarOpen ? '' : 'hidden'}
              lg:block
            `}
            aria-label="Search and filter products"
          >
            <div className="rounded-2xl border-2 border-gray-200/90 bg-white shadow-md shadow-gray-900/5 overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] flex flex-col">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-br from-primary-50/80 to-white">
                <div className="flex items-center gap-2 text-brand-ink">
                  <LayoutGrid className="h-5 w-5 text-primary-600 shrink-0" aria-hidden />
                  <h2 className="font-display font-bold text-lg text-gray-900">Browse</h2>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Search the list or pick a category. Updates instantly.
                </p>
              </div>

              <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1 min-h-0">
                <div>
                  <label htmlFor="products-search" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      id="products-search"
                      type="search"
                      placeholder="Name, brand, type…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoComplete="off"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    />
                    {searchTerm ? (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {categories.length > 1 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Category</p>
                    <ul className="space-y-1.5">
                      {categories.map((category) => {
                        const active = activeCategoryId === category.id;
                        return (
                          <li key={category.id}>
                            <button
                              type="button"
                              onClick={() => {
                                if (category.id === 'all') navigate('/products');
                                else navigate(productListingPathForCategory(category.id));
                              }}
                              className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium font-display transition-all border-2 ${
                                active
                                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                  : 'bg-gray-50 text-gray-800 border-transparent hover:border-primary-200 hover:bg-primary-50/60'
                              }`}
                            >
                              {category.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">More</p>
                  <Link
                    to="/toy-finder"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-primary-50 hover:text-primary-700 border-2 border-transparent hover:border-primary-100 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-primary-500 shrink-0" aria-hidden />
                    Toy Finder
                  </Link>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      navigate('/products');
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Right — product grid */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0" id="products-grid-region">
            <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-gray-200 max-lg:justify-between lg:justify-end">
              {!isLoading && !error && filteredProducts.length > 0 && (
                <button
                  type="button"
                  className="lg:hidden text-sm font-semibold text-primary-600 hover:text-primary-700 shrink-0"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  Focus on grid ↑
                </button>
              )}
              <p className="text-gray-700 text-right shrink-0">
                {!isLoading && !error && (
                  <>
                    <span className="font-display font-bold text-gray-900 text-lg">{filteredProducts.length}</span>
                    <span className="text-gray-600">
                      {' '}
                      {filteredProducts.length === 1 ? 'product' : 'products'}
                      {activeCategoryId !== 'all' && (
                        <span className="text-gray-500"> in {activeCategoryLabel}</span>
                      )}
                    </span>
                  </>
                )}
              </p>
            </div>

            {isLoading && (
              <div className="text-center py-16 rounded-2xl border border-gray-100 bg-white">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent" />
                <p className="mt-4 text-gray-600 font-medium">Loading products…</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16 rounded-2xl border border-red-100 bg-red-50/50">
                <p className="font-semibold text-red-700">Error loading products</p>
                <p className="text-sm text-gray-600 mt-2">Please try again later.</p>
              </div>
            )}

            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showBestSellerBadge={false}
                    onViewDetails={(p) => setPreviewProduct(p)}
                  />
                ))}
              </div>
            )}

            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80">
                <Search className="h-14 w-14 mx-auto text-gray-300 mb-4" aria-hidden />
                <h3 className="text-lg font-display font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try another category or clear your search — or visit the store and we’ll help you pick.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    navigate('/products');
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-5 py-2.5 font-display font-semibold hover:bg-primary-700 transition-colors"
                >
                  Show all products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      <ProductDetailModal
        product={previewProduct}
        isOpen={previewProduct != null}
        onClose={() => setPreviewProduct(null)}
        variant="quickLook"
      />
    </>
  );
};

export default Products;
