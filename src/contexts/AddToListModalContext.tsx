import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Gift, Minus, Plus, Sparkles, X } from 'lucide-react';
import type { Product } from '../types/catalog';
import { useCart } from './CartContext';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';

const CHEERS = [
  'Nice pick!',
  'Great eye for toys!',
  'That’s going on the mission list!',
  'Toy haul upgrade!',
  'Smart choice — add the details!',
  'Level up your list!',
];

type OpenOpts = { initialQuantity?: number };

type AddToListModalContextValue = {
  openAddToList: (product: Product, opts?: OpenOpts) => void;
};

const AddToListModalContext = createContext<AddToListModalContextValue | null>(null);

export function AddToListModalProvider({ children }: { children: React.ReactNode }) {
  const { addProduct, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [burst, setBurst] = useState(false);

  const existing = useMemo(() => {
    if (!product) return null;
    return items.find((l) => l.productId === String(product.id)) ?? null;
  }, [items, product]);

  useEffect(() => {
    if (product) {
      setHeadlineIdx(Math.floor(Math.random() * CHEERS.length));
    }
  }, [product?.id]);

  const close = useCallback(() => {
    setProduct(null);
    setQty(1);
    setNote('');
    setBurst(false);
  }, []);

  const openAddToList = useCallback((p: Product, opts?: OpenOpts) => {
    setProduct(p);
    setQty(Math.max(1, Math.floor(opts?.initialQuantity ?? 1) || 1));
    setNote('');
    setBurst(false);
  }, []);

  const confirm = useCallback(() => {
    if (!product) return;
    setBurst(true);
    window.setTimeout(() => {
      addProduct(product, {
        quantity: qty,
        note: note.trim() || undefined,
      });
      close();
    }, 280);
  }, [product, qty, note, addProduct, close]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));

  const img =
    product?.images?.[0] ?? (product ? getPlaceholderImage(200, 200, product.name) : '');

  const modal =
    product &&
    createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-list-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-brand-ink/70 backdrop-blur-sm"
          aria-label="Close"
          onClick={close}
        />
        <div
          className={`relative w-full max-w-md rounded-3xl bg-gradient-to-br from-white via-brand-sand/40 to-brand-peach/50 shadow-2xl border-4 border-brand-sunshine overflow-hidden transition-transform duration-200 ${
            burst ? 'scale-105' : 'scale-100'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-sunshine via-brand-coral to-brand-lavender" />
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-sunshine/30 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 bottom-20 w-28 h-28 rounded-full bg-brand-sky/25 blur-2xl pointer-events-none" />

          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 shadow-md border border-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative px-6 pt-8 pb-6 sm:px-8 sm:pt-9">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-6 w-6 text-brand-sunshine drop-shadow-sm" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700">
                Toy quest
              </span>
              <Sparkles className="h-6 w-6 text-brand-coral drop-shadow-sm" aria-hidden />
            </div>
            <h2
              id="add-to-list-title"
              className="text-center text-2xl sm:text-3xl font-display font-extrabold text-gray-900 mb-1"
            >
              {CHEERS[headlineIdx]}
            </h2>
            <p className="text-center text-sm text-gray-600 mb-5">
              Set how many you want and drop a note for the store team.
            </p>

            <div className="flex gap-4 items-start mb-5">
              <div className="shrink-0 w-24 h-24 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-contain p-1"
                  onError={(e) => handleImageError(e, product.name)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  {product.brand}
                </p>
                <p className="font-bold text-gray-900 leading-snug line-clamp-3 text-sm sm:text-base">
                  {product.name}
                </p>
                {existing && (
                  <p className="mt-2 text-xs font-semibold text-amber-800 bg-amber-100/90 border border-amber-200 rounded-lg px-2 py-1.5 inline-block">
                    Already on your list: {existing.quantity} in cart — we’ll add more below!
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 border-2 border-primary-100 p-4 mb-4 shadow-inner">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary-600" aria-hidden />
                  How many?
                </span>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  Max 99
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <button
                  type="button"
                  onClick={dec}
                  disabled={qty <= 1}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-800 font-bold text-xl hover:from-primary-50 hover:to-primary-100 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-6 w-6 mx-auto" />
                </button>
                <div className="min-w-[4rem] text-center">
                  <span className="text-4xl font-black tabular-nums text-gray-900 font-display">
                    {qty}
                  </span>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    qty
                  </p>
                </div>
                <button
                  type="button"
                  onClick={inc}
                  disabled={qty >= 99}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-b from-brand-sunshine to-brand-coral border-2 border-brand-sunshine text-white font-bold text-xl hover:brightness-105 active:scale-95 transition-transform shadow-md disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-6 w-6 mx-auto" />
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-gray-800 mb-1.5 block">
                Secret mission note{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. Need gift wrap, for a 5-year-old, any colour is fine…"
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary-100 bg-white/95 text-sm focus:ring-2 focus:ring-brand-sunshine focus:border-brand-sunshine resize-none shadow-sm"
              />
              <span className="text-[10px] text-gray-400 mt-1 block text-right">
                {note.length}/500
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={close}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={confirm}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-display font-bold text-lg shadow-lg hover:shadow-xl hover:from-primary-500 hover:to-primary-600 border-b-4 border-primary-800 active:border-b-0 active:translate-y-0.5 transition-all"
              >
                Add to my list!
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <AddToListModalContext.Provider value={{ openAddToList }}>
      {children}
      {modal}
    </AddToListModalContext.Provider>
  );
}

export function useAddToListModal(): AddToListModalContextValue {
  const ctx = useContext(AddToListModalContext);
  if (!ctx) {
    throw new Error('useAddToListModal must be used within AddToListModalProvider');
  }
  return ctx;
}
