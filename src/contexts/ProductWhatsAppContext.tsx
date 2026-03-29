import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ProductWhatsAppSnapshot = {
  name: string;
  slug: string;
  /** Canonical HTTPS URL for the product page (good for sharing) */
  pageUrl: string;
  brand?: string;
};

type CtxValue = {
  snapshot: ProductWhatsAppSnapshot | null;
  setProductForWhatsApp: (value: ProductWhatsAppSnapshot | null) => void;
};

const ProductWhatsAppContext = createContext<CtxValue | null>(null);

export function ProductWhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<ProductWhatsAppSnapshot | null>(null);
  const setProductForWhatsApp = useCallback((value: ProductWhatsAppSnapshot | null) => {
    setSnapshot(value);
  }, []);
  const value = useMemo(
    () => ({ snapshot, setProductForWhatsApp }),
    [snapshot, setProductForWhatsApp],
  );
  return <ProductWhatsAppContext.Provider value={value}>{children}</ProductWhatsAppContext.Provider>;
}

export function useProductWhatsApp(): CtxValue {
  const ctx = useContext(ProductWhatsAppContext);
  if (!ctx) {
    throw new Error('useProductWhatsApp must be used within ProductWhatsAppProvider');
  }
  return ctx;
}
