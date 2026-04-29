import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Layers, Sparkles } from 'lucide-react';
import type { RecommendationSections } from '../utils/productRecommendations';
import ProductCard from './ProductCard';

type Props = {
  sections: RecommendationSections;
};

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-brand-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">{icon}</span>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600 max-w-2xl">{subtitle}</p>
    </div>
  );
}

const ProductRecommendations: React.FC<Props> = ({ sections }) => {
  const { sameCategory, crossSell, similar } = sections;

  return (
    <section
      id="product-recommendations"
      className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t-2 border-gray-200/90 scroll-mt-24"
      aria-label="Recommended products"
    >
      {sameCategory.length > 0 && (
        <div className="mb-12 sm:mb-14">
          <SectionTitle
            icon={<Layers className="h-5 w-5" aria-hidden />}
            title="More from this category"
            subtitle="Similar items on the same shelf — great for collections or siblings."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {sameCategory.map((p) => (
              <ProductCard key={p.id} product={p} showBestSellerBadge={false} />
            ))}
          </div>
        </div>
      )}

      {crossSell.length > 0 && (
        <div className="mb-12 sm:mb-14">
          <SectionTitle
            icon={<Gift className="h-5 w-5" aria-hidden />}
            title="Goes well for the same occasion"
            subtitle="Different picks that match the same celebration or moment."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {crossSell.map((p) => (
              <ProductCard key={p.id} product={p} showBestSellerBadge={false} />
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="mb-4">
          <SectionTitle
            icon={<Sparkles className="h-5 w-5" aria-hidden />}
            title="You may also like"
            subtitle="Items other customers often buy alongside similar products."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} showBestSellerBadge={false} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 justify-center sm:justify-start">
        <Link
          to="/products"
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-5 py-2.5 text-sm font-display font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          Browse full catalogue
        </Link>
        <Link
          to="/toy-finder"
          className="inline-flex items-center justify-center rounded-xl border-2 border-primary-200 bg-white text-primary-700 px-5 py-2.5 text-sm font-display font-semibold hover:bg-primary-50 transition-colors"
        >
          Product finder
        </Link>
      </div>
    </section>
  );
};

export default ProductRecommendations;
