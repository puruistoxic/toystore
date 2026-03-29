import type { Product } from '../types/catalog';
import { resolveCategoryFilterId } from './productCategoryFilters';

function norm(s: string) {
  return s.toLowerCase().trim();
}

export function occasionsOverlap(a: string[] | undefined, b: string[] | undefined): number {
  if (!a?.length || !b?.length) return 0;
  const setA = new Set(a.map((x) => norm(x)));
  let n = 0;
  for (const x of b) {
    if (setA.has(norm(x))) n += 1;
  }
  return n;
}

function ageSimilarity(ageA?: string, ageB?: string): number {
  if (!ageA?.trim() || !ageB?.trim()) return 0;
  const a = ageA.toLowerCase().replace(/\s+/g, '');
  const b = ageB.toLowerCase().replace(/\s+/g, '');
  if (a === b) return 5;
  const numsA = ageA.match(/\d+/g) || [];
  const numsB = ageB.match(/\d+/g) || [];
  for (const x of numsA) {
    if (numsB.some((y) => x === y)) return 4;
  }
  if (a.includes('baby') && b.includes('baby')) return 3;
  if (a.includes('toddler') && b.includes('toddler')) return 3;
  return 0;
}

function genderCompatible(cur: Product['gender'], other: Product['gender']): boolean {
  if (!other || other === 'all') return true;
  if (!cur || cur === 'all' || cur === 'unisex') return true;
  if (other === 'unisex') return true;
  return cur === other;
}

/** Higher = stronger match for ranking */
export function scoreRelatedProduct(current: Product, other: Product): number {
  if (current.id === other.id) return -Infinity;
  if (!other.inStock) return -Infinity;

  let score = 0;
  const catCur = resolveCategoryFilterId(String(current.category || ''));
  const catOth = resolveCategoryFilterId(String(other.category || ''));
  if (catCur && catOth && catCur === catOth) score += 12;

  score += occasionsOverlap(current.occasion, other.occasion) * 8;
  score += ageSimilarity(current.ageGroup, other.ageGroup);
  if (current.educationalValue && other.educationalValue) score += 3;
  if (genderCompatible(current.gender, other.gender)) score += 2;
  else score -= 4;

  /* Cross-sell: different aisle, same celebration / use-case */
  if (catCur && catOth && catCur !== catOth && occasionsOverlap(current.occasion, other.occasion) > 0) {
    score += 6;
  }

  return score;
}

export type RecommendationSections = {
  sameCategory: Product[];
  crossSell: Product[];
  similar: Product[];
};

const DEFAULT_MAX = 4;

/**
 * Upsell = same category line. Cross-sell = shared occasion (often another category). Similar = scored remainder.
 */
export function buildRecommendationSections(
  current: Product,
  catalog: Product[],
  maxPerSection: number = DEFAULT_MAX,
): RecommendationSections {
  const others = catalog.filter((p) => p.id !== current.id && p.inStock);
  const curCat = resolveCategoryFilterId(String(current.category || ''));
  const scored = others
    .map((p) => ({ p, s: scoreRelatedProduct(current, p) }))
    .sort((a, b) => b.s - a.s);

  const used = new Set<string>();

  const sameCategory: Product[] = [];
  if (curCat) {
    for (const { p } of scored) {
      if (sameCategory.length >= maxPerSection) break;
      const oc = resolveCategoryFilterId(String(p.category || ''));
      if (oc === curCat && !used.has(p.id)) {
        sameCategory.push(p);
        used.add(p.id);
      }
    }
  }

  const crossSell: Product[] = [];
  const hasOccasion = (current.occasion?.length ?? 0) > 0;

  if (hasOccasion) {
    for (const { p } of scored) {
      if (crossSell.length >= maxPerSection) break;
      if (used.has(p.id)) continue;
      const oc = resolveCategoryFilterId(String(p.category || ''));
      if (curCat && oc === curCat) continue;
      if (occasionsOverlap(current.occasion, p.occasion) > 0) {
        crossSell.push(p);
        used.add(p.id);
      }
    }
    if (crossSell.length < Math.min(2, maxPerSection)) {
      for (const { p } of scored) {
        if (crossSell.length >= maxPerSection) break;
        if (used.has(p.id)) continue;
        if (occasionsOverlap(current.occasion, p.occasion) > 0) {
          crossSell.push(p);
          used.add(p.id);
        }
      }
    }
  }

  const similar: Product[] = [];
  for (const { p, s } of scored) {
    if (similar.length >= maxPerSection) break;
    if (used.has(p.id)) continue;
    if (s > 0) {
      similar.push(p);
      used.add(p.id);
    }
  }

  if (similar.length === 0) {
    for (const { p } of scored) {
      if (similar.length >= maxPerSection) break;
      if (!used.has(p.id)) {
        similar.push(p);
        used.add(p.id);
      }
    }
  }

  return { sameCategory, crossSell, similar };
}

export function recommendationSectionHasItems(s: RecommendationSections): boolean {
  return s.sameCategory.length + s.crossSell.length + s.similar.length > 0;
}

/** Cross-sell first, then same line, then similar — for a single “top pick” link */
export function getTopRecommendedProduct(sections: RecommendationSections): Product | null {
  if (sections.crossSell[0]) return sections.crossSell[0];
  if (sections.sameCategory[0]) return sections.sameCategory[0];
  return sections.similar[0] ?? null;
}

/** All in-stock products in the same resolved category, sorted for stable prev/next */
export function getCategorySiblingsOrdered(current: Product, catalog: Product[]): Product[] {
  const curCat = resolveCategoryFilterId(String(current.category || ''));
  if (!curCat) return [current];
  const same = catalog.filter(
    (p) => p.inStock && resolveCategoryFilterId(String(p.category || '')) === curCat,
  );
  if (same.length === 0) return [current];
  return same.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || String(a.id).localeCompare(String(b.id)),
  );
}

export function getNextProductInCategory(current: Product, siblings: Product[]): Product | null {
  if (siblings.length <= 1) return null;
  const i = siblings.findIndex((p) => p.id === current.id);
  if (i === -1) return null;
  return siblings[(i + 1) % siblings.length];
}

export function getPreviousProductInCategory(current: Product, siblings: Product[]): Product | null {
  if (siblings.length <= 1) return null;
  const i = siblings.findIndex((p) => p.id === current.id);
  if (i === -1) return null;
  return siblings[(i - 1 + siblings.length) % siblings.length];
}

/** Same category, next price step up (for “upgrade”) */
export function getUpgradeInCategory(current: Product, catalog: Product[]): Product | null {
  const curCat = resolveCategoryFilterId(String(current.category || ''));
  if (!curCat) return null;
  const curPrice = current.price > 0 ? current.price : 0;
  const candidates = catalog.filter(
    (p) =>
      p.id !== current.id &&
      p.inStock &&
      resolveCategoryFilterId(String(p.category || '')) === curCat &&
      p.price > curPrice,
  );
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => a.price - b.price)[0];
}
