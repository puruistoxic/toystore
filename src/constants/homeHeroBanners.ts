/** Homepage hero carousel slides (ids match `heroSlides` in Home.tsx). */
export const HOME_HERO_BANNER_SLIDES = [
  { id: '1', label: 'Your neighbourhood toy store', shortLabel: 'Neighbourhood' },
  { id: '2', label: 'Products by AGES', shortLabel: 'Ages' },
  { id: '3', label: 'Products by OCCASIONS', shortLabel: 'Occasions' },
  { id: '4', label: 'Featured Toy Collections', shortLabel: 'Featured' },
] as const;

export type HomeHeroBannerSlideId = (typeof HOME_HERO_BANNER_SLIDES)[number]['id'];

export const HOME_HERO_BANNER_IDS: string[] = HOME_HERO_BANNER_SLIDES.map((s) => s.id);

export function filterProductsForHeroSlide<T extends { homeBannerSlides?: string[] }>(
  products: T[],
  slideId: string
): T[] {
  return products.filter((p) => {
    const slides = p.homeBannerSlides;
    if (!slides || slides.length === 0) return false;
    return slides.includes(slideId);
  });
}
