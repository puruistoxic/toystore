import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { Product } from '../types/catalog';

type Props = {
  recommendedProduct: Product | null;
  showRecommendationsAnchor: boolean;
};

const btnClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-display font-semibold text-amber-950 transition-all hover:bg-amber-100 active:scale-[0.98] min-h-[44px]';

const ProductDetailQuickNav: React.FC<Props> = ({ recommendedProduct, showRecommendationsAnchor }) => {
  const showRecommended = recommendedProduct || showRecommendationsAnchor;
  if (!showRecommended) return null;

  if (recommendedProduct) {
    return (
      <div className="rounded-2xl border-2 border-primary-100 bg-gradient-to-r from-white via-primary-50/40 to-white p-3 shadow-sm">
        <Link to={`/products/${recommendedProduct.slug}`} className={btnClass}>
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span className="truncate text-left sm:text-center">Recommended: {recommendedProduct.name}</span>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-primary-100 bg-gradient-to-r from-white via-primary-50/40 to-white p-3 shadow-sm">
      <a href="#product-recommendations" className={btnClass}>
        <Sparkles className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        View recommended picks
        <ChevronRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </a>
    </div>
  );
};

export default ProductDetailQuickNav;
