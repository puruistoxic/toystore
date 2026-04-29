import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import ToyFinder from '../components/ToyFinder';
import ProductDetailModal from '../components/ProductDetailModal';
import { contentApi } from '../utils/api';
import { mapDbProductToFrontend } from '../utils/catalogFromDb';
import type { Product } from '../types/catalog';

const ToyFinderPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: dbProducts = [] } = useQuery({
    queryKey: ['products', 'public'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const allCatalogProducts = useMemo(
    () => dbProducts.map(mapDbProductToFrontend),
    [dbProducts]
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <SEO
        title="Product Finder | DigiDukaanLive"
        description="Find products by age, play style, and occasion. Quick questions to narrow our catalogue — then visit the store or message us for stock."
        path="/toy-finder"
        image="/images/hero/products-by-age.jpg"
        keywords="product finder, find gifts by age, gift ideas, DigiDukaanLive, online store India"
      />
      <div className="min-h-screen bg-gray-50">
        <ToyFinder products={allCatalogProducts} onViewProduct={handleProductClick} />
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ToyFinderPage;
