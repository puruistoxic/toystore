/** Shared category filters + resolution for Products page, header mega menu, etc. */

// Smart function to determine if an item is a service (not a product)
export function isServiceItem(dbProduct: any): boolean {
  const name = (dbProduct.name || '').toLowerCase();
  const category = (dbProduct.category || '').toLowerCase();
  const description = (dbProduct.description || '').toLowerCase();

  const serviceKeywords = [
    'installation',
    'service',
    'visit charge',
    'visit',
    'maintenance',
    'repair',
    'consultation',
    'support',
    'setup',
    'configuration',
    'training',
    'amc',
    'annual maintenance',
  ];

  const serviceCategories = [
    'installation service',
    'maintenance service',
    'visit charge',
    'software service',
    'internet service',
    'service',
  ];

  if (serviceKeywords.some((keyword) => name.includes(keyword))) {
    return true;
  }

  if (serviceCategories.some((cat) => category.includes(cat))) {
    return true;
  }

  if (
    description.includes('service') &&
    (description.includes('installation') ||
      description.includes('visit') ||
      description.includes('maintenance') ||
      description.includes('support'))
  ) {
    return true;
  }

  return false;
}

/** URL / nav slugs that differ from filter ids */
export const CATEGORY_PARAM_ALIASES: Record<string, string> = {
  'board-games': 'card-board-games',
  dolls: 'doll-doll-house',
  'role-play': 'role-play-set',
};

export const PRODUCT_CATEGORY_FILTERS: { id: string; name: string; match: string[] }[] = [
  { id: 'action-figures', name: 'Action Figures', match: ['action figures'] },
  { id: 'art-crafts', name: 'Art and Crafts', match: ['art and crafts', 'art & crafts', 'art-and-crafts'] },
  { id: 'baby-rattles', name: 'Baby Rattles', match: ['baby rattles'] },
  { id: 'bath-toys', name: 'Bath Toys', match: ['bath toys'] },
  { id: 'card-board-games', name: 'Card & Board Games', match: ['card & board games', 'board games'] },
  { id: 'doll-doll-house', name: 'Doll & Doll House', match: ['doll & doll house', 'dolls', 'dolls & doll houses'] },
  { id: 'drone', name: 'Drone', match: ['drone'] },
  {
    id: 'educational-learning',
    name: 'Educational & Learning Toys',
    match: ['educational & learning toys', 'educational & learning', 'educational-learning-toys'],
  },
  { id: 'electric-ride-ons', name: 'Electric Ride Ons', match: ['electric ride ons'] },
  { id: 'manual-ride-ons', name: 'Manual Ride Ons', match: ['manual ride ons'] },
  { id: 'metal-toys', name: 'Metal Toys', match: ['metal toys'] },
  { id: 'musical-toys', name: 'Musical Toys', match: ['musical toys'] },
  { id: 'musical-instruments', name: 'Musical Instruments', match: ['musical instruments'] },
  { id: 'remote-control', name: 'Remote Control Toys', match: ['remote control toys'] },
  { id: 'role-play-set', name: 'Role Play Set', match: ['role play set', 'role play'] },
  { id: 'soft-toys', name: 'Soft Toys', match: ['soft toys'] },
  { id: 'sports-toys', name: 'Sports Toys', match: ['sports toys'] },
  { id: 'train-set', name: 'Train Set', match: ['train set'] },
  { id: 'vehicles-pull-back', name: 'Vehicles & Pull Back', match: ['vehicles & pull back', 'vehicles and pull back'] },
  { id: 'wooden-toys', name: 'Wooden Toys', match: ['wooden toys'] },
  { id: 'kids-drinkware', name: 'Kids Drinkware', match: ['kids drinkware', 'drinkware'] },
];

function slugifyCategoryLabel(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function resolveCategoryFilterId(raw: string): string | null {
  if (!raw || !String(raw).trim()) return null;
  let t = String(raw).trim().toLowerCase();
  if (CATEGORY_PARAM_ALIASES[t]) t = CATEGORY_PARAM_ALIASES[t];

  for (const c of PRODUCT_CATEGORY_FILTERS) {
    if (c.id === t) return c.id;
    if (c.match.some((m) => m === t)) return c.id;
    if (slugifyCategoryLabel(c.name) === t) return c.id;
  }
  return null;
}

/** Canonical filter ids — use to validate URL segments without tying to current stock */
export const KNOWN_PRODUCT_CATEGORY_IDS: ReadonlySet<string> = new Set(
  PRODUCT_CATEGORY_FILTERS.map((c) => c.id),
);

/** SEO-friendly listing URL (keeps `/products/:slug` free for product detail) */
export function productListingPathForCategory(categoryId: string): string {
  return `/products/category/${categoryId}`;
}
