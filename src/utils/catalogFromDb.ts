import type { Product } from '../types/catalog';
import { HOME_HERO_BANNER_IDS } from '../constants/homeHeroBanners';
import { getPlaceholderImage } from './imagePlaceholder';
import { resolveMediaUrl } from './mediaUrl';

function normalizeHomeBannerSlidesFromDb(dbProduct: any): string[] {
  const allowed = new Set(HOME_HERO_BANNER_IDS);
  const raw = dbProduct.home_banner_slides;
  let parsed: string[] = [];
  if (raw != null) {
    if (Array.isArray(raw)) {
      parsed = raw.map(String).filter(Boolean);
    } else if (typeof raw === 'string') {
      try {
        const j = JSON.parse(raw);
        if (Array.isArray(j)) parsed = j.map(String).filter(Boolean);
      } catch {
        /* ignore */
      }
    }
  }
  parsed = parsed.filter((id) => allowed.has(id));
  if (parsed.length > 0) return parsed;
  if (dbProduct.promote_home_banner) {
    return [...HOME_HERO_BANNER_IDS];
  }
  return [];
}

function normalizeDbVideoUrls(dbProduct: any): string[] {
  const v = dbProduct.video_urls;
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p.map(String).map((s) => s.trim()).filter(Boolean) : [];
    } catch {
      return v.trim() ? [v.trim()] : [];
    }
  }
  return [];
}

/** Map API/database product row to storefront `Product` */
export function mapDbProductToFrontend(dbProduct: any): Product {
  const images = dbProduct.images ? (Array.isArray(dbProduct.images) ? dbProduct.images : [dbProduct.images]) : [];
  if (dbProduct.image && !images.includes(dbProduct.image)) {
    images.unshift(dbProduct.image);
  }
  if (images.length === 0 || !images[0] || images[0].trim() === '') {
    images.push(getPlaceholderImage(400, 300, dbProduct.name || 'Product'));
  }
  const resolvedImages = images.map((src: string) => resolveMediaUrl(src));

  const features = dbProduct.features ? (Array.isArray(dbProduct.features) ? dbProduct.features : []) : [];
  const specifications = dbProduct.specifications ? (typeof dbProduct.specifications === 'object' ? dbProduct.specifications : {}) : {};

  let occasion: string[] = [];
  if (dbProduct.occasion) {
    if (typeof dbProduct.occasion === 'string') {
      try {
        occasion = JSON.parse(dbProduct.occasion);
      } catch {
        occasion = [dbProduct.occasion];
      }
    } else if (Array.isArray(dbProduct.occasion)) {
      occasion = dbProduct.occasion;
    }
  }

  const rawPrice = dbProduct.price;
  let priceNum = 0;
  if (rawPrice != null && rawPrice !== '') {
    const n = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice));
    if (Number.isFinite(n) && n >= 0) {
      priceNum = n;
    }
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description || dbProduct.short_description || 'High-quality toy product',
    price: priceNum,
    originalPrice: undefined,
    images: resolvedImages,
    videoUrls: normalizeDbVideoUrls(dbProduct),
    homeBannerSlides: normalizeHomeBannerSlidesFromDb(dbProduct),
    category: dbProduct.category || 'toys',
    brand: dbProduct.brand || 'DigiDukaanLive',
    model: specifications.model || specifications.Model || dbProduct.name,
    inStock: dbProduct.stock_quantity ? dbProduct.stock_quantity > 0 : true,
    stockQuantity: dbProduct.stock_quantity || 0,
    rating: 4.5,
    reviews: 0,
    features: features,
    specifications: specifications,
    warranty: dbProduct.warranty || undefined,
    ageGroup: dbProduct.age_group,
    occasion: occasion,
    gender: dbProduct.gender,
    materialType: dbProduct.material_type,
    educationalValue: dbProduct.educational_value || false,
    minimumOrderQuantity: dbProduct.minimum_order_quantity || 1,
    bulkDiscountPercentage: dbProduct.bulk_discount_percentage || 0,
    sku: dbProduct.sku,
    priceIncludesGst: dbProduct.price_includes_gst || false,
  };
}
