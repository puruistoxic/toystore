import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types/catalog';
import { handleImageError } from '../utils/imagePlaceholder';
import {
  PRODUCT_CATEGORY_FILTERS,
  resolveCategoryFilterId,
} from '../utils/productCategoryFilters';

function categoryLabel(product: Product): string {
  const id = resolveCategoryFilterId(String(product.category || ''));
  if (id) {
    const meta = PRODUCT_CATEGORY_FILTERS.find((c) => c.id === id);
    if (meta) return meta.name;
  }
  const raw = String(product.category || '').trim();
  if (raw) {
    return raw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return 'Toys';
}

export interface HeroPromotedProductSliderProps {
  products: Product[];
  autoMs?: number;
}

/**
 * Single-product carousel for homepage hero (promoted / home-banner products).
 */
const HeroPromotedProductSlider: React.FC<HeroPromotedProductSliderProps> = ({
  products,
  autoMs = 5500,
}) => {
  const [index, setIndex] = useState(0);
  const n = products.length;

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (n <= 1 || autoMs <= 0) return;
    const t = window.setInterval(() => go(1), autoMs);
    return () => window.clearInterval(t);
  }, [n, autoMs, go]);

  if (n === 0) return null;

  const product = products[index];
  const cat = categoryLabel(product);
  const img = product.images?.[0];

  return (
    <div
      className="w-full max-w-[20rem] xl:max-w-[22rem] mx-auto lg:mx-0 lg:ml-auto"
      aria-roledescription="carousel"
      aria-label="Promoted products"
    >
      <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md mb-2 text-center lg:text-right">
        In focus now
      </p>
      <div className="relative rounded-2xl bg-white/95 shadow-xl border-2 border-brand-sunshine/90 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-y-0 left-0 z-10 flex items-center">
          <button
            type="button"
            onClick={() => go(-1)}
            className="m-1 p-1.5 rounded-full bg-white/90 text-primary-700 shadow-md border border-primary-100 hover:bg-primary-50 transition-colors"
            aria-label="Previous promoted product"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 z-10 flex items-center">
          <button
            type="button"
            onClick={() => go(1)}
            className="m-1 p-1.5 rounded-full bg-white/90 text-primary-700 shadow-md border border-primary-100 hover:bg-primary-50 transition-colors"
            aria-label="Next promoted product"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="block pt-2 pb-3 px-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sunshine focus-visible:ring-inset"
        >
          <div className="aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden mx-auto max-h-[200px] xl:max-h-[220px]">
            {img ? (
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain p-2"
                loading="lazy"
                onError={(e) => handleImageError(e, product.name)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}
          </div>
          <div className="mt-3 text-center px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-600 mb-1 line-clamp-1">
              {cat}
            </p>
            <p className="text-sm xl:text-base font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </p>
            {product.price > 0 && (
              <p className="text-sm font-bold text-primary-600 mt-1.5 tabular-nums">
                ₹{Number(product.price).toLocaleString('en-IN')}
                {product.priceIncludesGst ? (
                  <span className="text-[10px] font-normal text-gray-500 ml-1">incl. GST</span>
                ) : null}
              </p>
            )}
            <span className="inline-block mt-2 text-xs font-semibold text-primary-600 hover:underline">
              View product
            </span>
          </div>
        </Link>

        {n > 1 && (
          <div className="flex justify-center gap-1.5 pb-3 px-4" role="tablist" aria-label="Promoted product slides">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show promoted product ${i + 1} of ${n}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroPromotedProductSlider;
