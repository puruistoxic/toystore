import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Baby,
  ChevronDown,
  Compass,
  Gift,
  Palette,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { Product } from '../types/catalog';
import ProductCard from './ProductCard';

export type ToyFinderAge = 'any' | '0-2' | '3-5' | '6-8' | '9-12' | '13+';
export type ToyFinderStyle =
  | 'any'
  | 'active'
  | 'creative'
  | 'learn'
  | 'dolls'
  | 'games';
export type ToyFinderOccasion = 'any' | 'birthday' | 'festival' | 'school' | 'everyday';

const AGE_OPTIONS: { id: ToyFinderAge; label: string }[] = [
  { id: 'any', label: 'Any age' },
  { id: '0-2', label: 'Baby & toddler (0–2)' },
  { id: '3-5', label: 'Preschool (3–5)' },
  { id: '6-8', label: 'School-age (6–8)' },
  { id: '9-12', label: 'Tweens (9–12)' },
  { id: '13+', label: 'Teens (13+)' },
];

const STYLE_OPTIONS: { id: ToyFinderStyle; label: string }[] = [
  { id: 'any', label: 'Surprise me' },
  { id: 'active', label: 'Active play & vehicles' },
  { id: 'creative', label: 'Creative & arts' },
  { id: 'learn', label: 'Learning & puzzles' },
  { id: 'dolls', label: 'Dolls & pretend play' },
  { id: 'games', label: 'Board & family games' },
];

const OCCASION_OPTIONS: { id: ToyFinderOccasion; label: string }[] = [
  { id: 'any', label: 'No preference' },
  { id: 'birthday', label: 'Birthday gift' },
  { id: 'festival', label: 'Festival / celebration' },
  { id: 'school', label: 'Back to school' },
  { id: 'everyday', label: 'Everyday play' },
];

const STYLE_CATEGORY_HINTS: Record<Exclude<ToyFinderStyle, 'any'>, string[]> = {
  active: [
    'action-figures',
    'remote-control',
    'drone',
    'electric-ride-ons',
    'manual-ride-ons',
    'bath-toys',
  ],
  creative: ['art-crafts'],
  learn: ['educational-learning', 'board-games', 'baby-rattles', 'coin-bank'],
  dolls: ['dolls', 'role-play'],
  games: ['board-games'],
};

function looseCat(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesAge(product: Product, age: ToyFinderAge): boolean {
  if (age === 'any') return true;
  const ag = (product.ageGroup || '').toLowerCase();
  if (!ag.trim()) return true;

  const checks: Record<Exclude<ToyFinderAge, 'any'>, RegExp[]> = {
    '0-2': [/0[\s-]*2/, /baby|infant|toddler/, /0-1/],
    '3-5': [/3[\s-]*5/, /preschool/, /3\+/],
    '6-8': [/6[\s-]*8/, /school/, /6\+/],
    '9-12': [/9[\s-]*12/, /tween/, /9\+/],
    '13+': [/13/, /teen/],
  };
  const patterns = checks[age as Exclude<ToyFinderAge, 'any'>];
  return patterns.some((re) => re.test(ag));
}

const STYLE_FALLBACK: Record<Exclude<ToyFinderStyle, 'any'>, string[]> = {
  active: ['remote', 'control', 'action', 'figure', 'drone', 'ride', 'vehicle', 'helicopter'],
  creative: ['art', 'craft', 'colour', 'color', 'draw', 'sketch'],
  learn: ['educational', 'learning', 'puzzle', 'steam', 'stem', 'science', 'alphabet'],
  dolls: ['doll', 'barbie', 'pretend', 'playset', 'kitchen'],
  games: ['board', 'game', 'monopoly', 'chess', 'card', 'family'],
};

function matchesStyle(product: Product, style: ToyFinderStyle): boolean {
  if (style === 'any') return true;
  const blob = looseCat(`${product.category || ''} ${product.name || ''}`);
  const hints = STYLE_CATEGORY_HINTS[style];
  if (hints.some((h) => blob.includes(looseCat(h)))) return true;
  return STYLE_FALLBACK[style].some((w) => blob.includes(looseCat(w)));
}

function matchesOccasion(product: Product, occ: ToyFinderOccasion): boolean {
  if (occ === 'any' || occ === 'everyday') return true;
  const list = (product.occasion || []).map((o) => o.toLowerCase());
  if (list.length === 0) return true;

  if (occ === 'birthday') return list.some((o) => o.includes('birthday'));
  if (occ === 'festival')
    return list.some((o) => /festival|diwali|holi|eid|christmas|celebration/.test(o));
  if (occ === 'school') return list.some((o) => /school|academic|stationery|study/.test(o));
  return true;
}

function filterCatalog(products: Product[], age: ToyFinderAge, style: ToyFinderStyle, occ: ToyFinderOccasion) {
  return products.filter((p) => matchesAge(p, age) && matchesStyle(p, style) && matchesOccasion(p, occ));
}

type ToyFinderProps = {
  products: Product[];
  onViewProduct: (product: Product) => void;
};

function explorerTitle(specificSteps: number): string {
  if (specificSteps >= 3) return 'Treasure hunter';
  if (specificSteps === 2) return 'Sharp picker';
  if (specificSteps === 1) return 'Curious explorer';
  return 'Open adventurer';
}

const ToyFinder: React.FC<ToyFinderProps> = ({ products, onViewProduct }) => {
  const [age, setAge] = useState<ToyFinderAge>('any');
  const [style, setStyle] = useState<ToyFinderStyle>('any');
  const [occasion, setOccasion] = useState<ToyFinderOccasion>('any');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(true);

  const picks = useMemo(
    () => filterCatalog(products, age, style, occasion),
    [products, age, style, occasion],
  );

  const displayPicks = useMemo(() => picks.slice(0, 24), [picks]);

  const specificSteps = useMemo(
    () => [age !== 'any', style !== 'any', occasion !== 'any'].filter(Boolean).length,
    [age, style, occasion],
  );

  const questProgress = useMemo(() => (specificSteps / 3) * 100, [specificSteps]);

  const scrollToResults = useCallback(() => {
    document.getElementById('finder-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileFiltersOpen(false);
  }, []);

  const filterSidebar = (
    <aside
      className={`
        rounded-2xl border-2 border-primary-200/80 bg-gradient-to-b from-white via-primary-50/40 to-white
        shadow-lg shadow-primary-900/5 overflow-hidden
        ${mobileFiltersOpen ? 'flex flex-col' : 'max-lg:hidden'}
        lg:flex lg:flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)]
      `}
      aria-label="Product finder filters"
    >
      <div className="p-4 sm:p-5 border-b border-primary-100 bg-brand-ink/[0.03]">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md ring-2 ring-white/50">
            <Compass className="h-6 w-6" strokeWidth={2.2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-primary-600">
              Your quest
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-display leading-tight">
              Pick three clues
            </h2>
            <p className="text-xs text-gray-600 mt-1 leading-snug">
              Each choice narrows the loot. Mix freely — updates instantly.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5 text-primary-500" aria-hidden />
              Quest progress
            </span>
            <span className="text-brand-ink font-display">{Math.round(questProgress)}%</span>
          </div>
          <div
            className="h-2.5 rounded-full bg-gray-200/90 overflow-hidden ring-1 ring-inset ring-gray-300/50"
            role="progressbar"
            aria-valuenow={Math.round(questProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="How many specific choices you have selected"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-sunshine via-primary-500 to-primary-600 transition-all duration-500 ease-out"
              style={{ width: `${questProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" aria-hidden />
            Rank: <strong className="text-gray-800">{explorerTitle(specificSteps)}</strong>
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1 min-h-0">
        <FinderBlock
          step={1}
          icon={<Baby className="h-4 w-4" aria-hidden />}
          title="Who’s it for?"
          subtitle="Age helps match developmental fit."
          options={AGE_OPTIONS}
          selected={age}
          onSelect={(id) => setAge(id as ToyFinderAge)}
        />
        <FinderBlock
          step={2}
          icon={<Palette className="h-4 w-4" aria-hidden />}
          title="What sounds fun?"
          subtitle="Vibe → product types in our store."
          options={STYLE_OPTIONS}
          selected={style}
          onSelect={(id) => setStyle(id as ToyFinderStyle)}
        />
        <FinderBlock
          step={3}
          icon={<Gift className="h-4 w-4" aria-hidden />}
          title="What’s the occasion?"
          subtitle="Uses product tags when we have them."
          options={OCCASION_OPTIONS}
          selected={occasion}
          onSelect={(id) => setOccasion(id as ToyFinderOccasion)}
        />
      </div>

      <div className="p-4 border-t border-primary-100 bg-primary-50/50 lg:hidden">
        <button
          type="button"
          onClick={scrollToResults}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white font-display font-bold py-3 shadow-md active:scale-[0.98] transition-transform"
        >
          See {picks.length} match{picks.length === 1 ? '' : 'es'}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </aside>
  );

  return (
    <section
      id="toy-finder"
      className="py-10 md:py-14 lg:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden scroll-mt-24 md:scroll-mt-28"
    >
      <div className="absolute top-16 left-0 w-72 h-72 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-80 h-80 bg-brand-lavender/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page intro — full width */}
        <header className="text-center mb-8 lg:mb-10 max-w-2xl mx-auto">
          <p className="text-primary-600 font-display font-bold text-xs sm:text-sm uppercase tracking-[0.2em] mb-2">
            Product finder
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-gray-900 font-display mb-3">
            Find the right product
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            A quick, playful way to explore the catalogue — filters on the left (or tap below on your phone), treasures on
            the right.
          </p>
        </header>

        {/* Mobile: toggle filters */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm text-left active:bg-gray-50 transition-colors"
            aria-expanded={mobileFiltersOpen}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 shrink-0">
                <Compass className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-gray-900">Your quest</span>
                <span className="block text-xs text-gray-500 truncate">
                  {specificSteps}/3 clues · {picks.length} match{picks.length === 1 ? '' : 'es'}
                </span>
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 shrink-0 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-4 xl:col-span-3">{filterSidebar}</div>

          <div className="lg:col-span-8 xl:col-span-9 min-w-0" id="finder-results">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display flex items-center gap-2 flex-wrap">
                  Your picks
                  {picks.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 text-sm font-display font-bold px-3 py-0.5">
                      <Sparkles className="h-4 w-4" aria-hidden />
                      {picks.length}
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {picks.length === 0
                    ? 'No exact matches — loosen a clue or browse the full shop.'
                    : `Showing ${displayPicks.length} of ${picks.length} — tap cards for details.`}
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 text-primary-600 font-display font-semibold hover:text-primary-700 whitespace-nowrap text-sm sm:text-base"
              >
                Browse full catalogue
                <ArrowRight className="w-5 h-5" aria-hidden />
              </Link>
            </div>

            {displayPicks.length > 0 ? (
              <div
                key={`${age}-${style}-${occasion}-${displayPicks.length}`}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 transition-opacity duration-300"
              >
                {displayPicks.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={onViewProduct}
                    showBestSellerBadge={false}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white py-14 px-6 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
                  <Compass className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-gray-700 font-medium mb-4 max-w-md mx-auto">
                  Widen your quest — try &quot;Any age&quot;, &quot;Surprise me&quot;, or &quot;No preference&quot;.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-display font-semibold hover:bg-primary-700 transition-colors shadow-md active:scale-[0.98]"
                >
                  View all products
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

function FinderBlock<T extends string>({
  step,
  icon,
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  options: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200/90 bg-white/90 p-3 sm:p-4 shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-ink text-white text-xs font-display font-bold shrink-0">
          {step}
        </span>
        <span className="text-primary-600">{icon}</span>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 font-display leading-tight">{title}</h3>
      </div>
      <p className="text-[11px] sm:text-xs text-gray-500 mb-3 ml-9">{subtitle}</p>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {options.map((opt) => {
          const isOn = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`
                w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border-2
                motion-safe:transition-transform motion-safe:active:scale-[0.98]
                ${
                  isOn
                    ? 'bg-brand-ink text-white border-brand-ink shadow-md ring-2 ring-primary-400/30'
                    : 'bg-gray-50/80 text-gray-800 border-transparent hover:border-primary-300 hover:bg-primary-50/60'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ToyFinder;
