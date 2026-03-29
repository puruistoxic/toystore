import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Product } from '../types/catalog';

const STORAGE_KEY = 'khandelwal-cart-v1';

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  /** First product image URL for cart / PDF context */
  imageUrl?: string;
  /** Optional note for this line (e.g. from add-to-list modal) */
  note?: string;
};

export type AddToListOptions = {
  quantity?: number;
  note?: string;
};

function mergeLineNotes(prev?: string, incoming?: string): string | undefined {
  if (!incoming?.trim()) return prev;
  const n = incoming.trim();
  if (!prev?.trim()) return n;
  if (prev.includes(n)) return prev;
  return `${prev.trim()} · ${n}`;
}

type CartContextValue = {
  items: CartLine[];
  totalItems: number;
  /** Pass a number (quantity only) or `{ quantity, note }` from the add-to-list flow */
  addProduct: (product: Product, quantityOrOptions?: number | AddToListOptions) => void;
  setLineQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row: unknown) =>
          row &&
          typeof row === 'object' &&
          typeof (row as CartLine).productId === 'string' &&
          typeof (row as CartLine).slug === 'string' &&
          typeof (row as CartLine).name === 'string' &&
          typeof (row as CartLine).quantity === 'number',
      )
      .map((row: CartLine) => ({
        productId: row.productId,
        slug: row.slug,
        name: row.name,
        brand: row.brand,
        price: typeof row.price === 'number' ? row.price : 0,
        quantity: Math.max(1, Math.floor(row.quantity)),
        imageUrl: typeof row.imageUrl === 'string' && row.imageUrl.trim() ? row.imageUrl.trim() : undefined,
        note: typeof row.note === 'string' && row.note.trim() ? row.note.trim() : undefined,
      }));
  } catch {
    return [];
  }
}

function saveToStorage(items: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() =>
    typeof window !== 'undefined' ? loadFromStorage() : [],
  );

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addProduct = useCallback((product: Product, quantityOrOptions?: number | AddToListOptions) => {
    const id = String(product.id);
    let addQty = 1;
    let incomingNote: string | undefined;
    if (typeof quantityOrOptions === 'number') {
      addQty = Math.max(1, Math.floor(quantityOrOptions) || 1);
    } else if (quantityOrOptions && typeof quantityOrOptions === 'object') {
      addQty = Math.max(1, Math.floor(quantityOrOptions.quantity ?? 1) || 1);
      incomingNote = quantityOrOptions.note?.trim() || undefined;
    }
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.productId === id);
      const thumb = product.images?.[0];
      if (idx >= 0) {
        const next = [...prev];
        const cur = next[idx];
        next[idx] = {
          ...cur,
          quantity: cur.quantity + addQty,
          imageUrl: cur.imageUrl || thumb,
          note: mergeLineNotes(cur.note, incomingNote),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price || 0,
          quantity: addQty,
          imageUrl: thumb,
          note: incomingNote,
        },
      ];
    });
  }, []);

  const setLineQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity) || 1);
    setItems((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)));
  }, []);

  const removeLine = useCallback((productId: string) => {
    setItems((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, l) => sum + l.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      addProduct,
      setLineQuantity,
      removeLine,
      clearCart,
    }),
    [items, totalItems, addProduct, setLineQuantity, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
