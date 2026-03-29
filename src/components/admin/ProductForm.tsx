import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, ChevronUp, ChevronDown, ImageIcon } from 'lucide-react';
import api from '../../utils/api';
import RichTextEditor from './RichTextEditor';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { HOME_HERO_BANNER_IDS, HOME_HERO_BANNER_SLIDES } from '../../constants/homeHeroBanners';

interface ProductFormProps {
  productId?: string;
}

interface ProductFormState {
  name: string;
  slug: string;
  price: string;
  priceIncludesGst: boolean;
  category: string;
  brand: string;
  hsnCode: string;
  shortDescription: string;
  description: string;
  youtubeLinks: string; // one YouTube URL per line
  features: string; // one feature per line
  specifications: string; // key: value per line
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string; // comma-separated
  isActive: boolean;
  /** Homepage hero slide ids (`1`–`4`) where this product appears */
  homeBannerSlideIds: string[];
  /** Lower numbers appear first (0–999) within each hero slide carousel */
  bannerSortOrder: string;
}

const emptyState: ProductFormState = {
  name: '',
  slug: '',
  price: '',
  priceIncludesGst: false,
  category: '',
  brand: '',
  hsnCode: '',
  shortDescription: '',
  description: '',
  youtubeLinks: '',
  features: '',
  specifications: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isActive: true,
  homeBannerSlideIds: [],
  bannerSortOrder: '0',
};

function mergeProductImagesFromApi(data: any): string[] {
  const raw = data.images
    ? Array.isArray(data.images)
      ? [...data.images]
      : [data.images]
    : [];
  if (data.image && typeof data.image === 'string' && data.image.trim() && !raw.includes(data.image)) {
    raw.unshift(data.image);
  }
  return raw.map((u: string) => u.trim()).filter(Boolean);
}

function parseHomeBannerSlidesFromApi(data: any): string[] {
  const allowed = new Set(HOME_HERO_BANNER_IDS);
  let raw = data.home_banner_slides;
  let arr: string[] = [];
  if (Array.isArray(raw)) {
    arr = raw.map(String);
  } else if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw);
      if (Array.isArray(j)) arr = j.map(String);
    } catch {
      /* ignore */
    }
  }
  arr = arr.filter((id) => allowed.has(id));
  if (arr.length > 0) {
    return Array.from(new Set(arr)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }
  if (data.promote_home_banner) {
    return [...HOME_HERO_BANNER_IDS];
  }
  return [];
}

function normalizeVideoUrlsFromApi(data: any): string[] {
  const v = data.video_urls;
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

export default function ProductForm({ productId }: ProductFormProps) {
  const isEdit = !!productId;
  const [form, setForm] = useState<ProductFormState>(emptyState);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/content/products/${productId}`);

        setForm({
          name: data.name || '',
          slug: data.slug || '',
          price: data.price != null ? String(data.price) : '',
          priceIncludesGst: data.price_includes_gst === true,
          category: data.category || '',
          brand: data.brand || '',
          hsnCode: data.hsn_code || '',
          shortDescription: data.short_description || '',
          description: data.description || '',
          youtubeLinks: normalizeVideoUrlsFromApi(data).join('\n'),
          features: Array.isArray(data.features) ? data.features.join('\n') : '',
          specifications: data.specifications
            ? Object.entries(data.specifications)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')
            : '',
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : '',
          isActive: data.is_active !== false,
          homeBannerSlideIds: parseHomeBannerSlidesFromApi(data),
          bannerSortOrder:
            data.banner_sort_order != null && data.banner_sort_order !== ''
              ? String(data.banner_sort_order)
              : '0',
        });
        setImageUrls(mergeProductImagesFromApi(data));
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isEdit, productId]);

  // Load master data for autocomplete
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get('/content/brands'),
          api.get('/content/categories')
        ]);
        setBrandOptions(
          (brandsRes.data || []).map((b: any) => ({
            id: b.slug || b.id,
            name: b.name
          }))
        );
        setCategoryOptions(
          (categoriesRes.data || []).map((c: any) => ({
            id: c.slug || c.id,
            name: c.name
          }))
        );
      } catch (e) {
        // non-fatal for form; ignore
      }
    };

    loadMasters();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;

    let nextValue: string | boolean = value;
    if ((target as HTMLInputElement).type === 'checkbox') {
      nextValue = (target as HTMLInputElement).checked;
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    setError(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { data } = await api.post<{ urls?: string[] }>('/upload/images', fd);
      const urls = data.urls || [];
      if (urls.length) {
        setImageUrls((prev) => [...prev, ...urls]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const updateImageUrlAt = (index: number, url: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const removeImageAt = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImageUrls((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const featuresArray =
        form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean) || [];

      const imagesArray = imageUrls.map((url) => url.trim()).filter(Boolean);

      const videoUrlsArray =
        form.youtubeLinks
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean) || [];

      const specs: Record<string, string> = {};
      form.specifications
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const [key, ...rest] = line.split(':');
          if (!key) return;
          specs[key.trim()] = rest.join(':').trim();
        });

      const seoKeywordsArray =
        form.seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean) || [];

      const payload = {
        id: productId || undefined,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        short_description: form.shortDescription.trim(),
        price: form.price ? parseFloat(form.price) : null,
        price_includes_gst: form.priceIncludesGst,
        category: form.category.trim() || null,
        brand: form.brand.trim() || null,
        hsn_code: form.hsnCode.trim() || null,
        image: imagesArray[0] || null,
        images: imagesArray,
        video_urls: videoUrlsArray,
        features: featuresArray,
        specifications: specs,
        warranty: null,
        seo_title: form.seoTitle.trim() || null,
        seo_description: form.seoDescription.trim() || null,
        seo_keywords: seoKeywordsArray,
        is_active: form.isActive,
        promote_home_banner: form.homeBannerSlideIds.length > 0,
        home_banner_slides: form.homeBannerSlideIds,
        banner_sort_order: (() => {
          const n = parseInt(form.bannerSortOrder, 10);
          return Number.isFinite(n) ? Math.min(999, Math.max(0, n)) : 0;
        })(),
      };

      if (isEdit) {
        await api.put(`/content/products/${productId}`, payload);
      } else {
        // Let backend generate UUID - don't include id in payload
        delete payload.id;
        await api.post('/content/products', payload);
      }

      navigate('/admin/products');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
          <p className="mt-4 text-gray-600 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="flex items-center space-x-2">
            <input
              name="category"
              list="category-options"
              value={form.category}
              onChange={handleChange}
              placeholder="Select or type category"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-lg font-semibold"
            >
              +
            </button>
            <datalist id="category-options">
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <div className="flex items-center space-x-2">
            <input
              name="brand"
              list="brand-options"
              value={form.brand}
              onChange={handleChange}
              placeholder="Select or type brand"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowBrandModal(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-lg font-semibold"
            >
              +
            </button>
            <datalist id="brand-options">
              {brandOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HSN Code <span className="text-gray-500 text-xs">(for GST)</span>
          </label>
          <input
            name="hsnCode"
            type="text"
            value={form.hsnCode}
            onChange={handleChange}
            placeholder="e.g., 9503"
            maxLength={20}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="priceIncludesGst"
            name="priceIncludesGst"
            type="checkbox"
            checked={form.priceIncludesGst}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label htmlFor="priceIncludesGst" className="text-sm text-gray-700">
            Price includes GST
          </label>
          <span className="text-xs text-gray-500 ml-2">
            (Check if the product price already includes GST)
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-6 md:mt-8">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active
          </label>
        </div>
        <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/80 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-900">Homepage hero — “In focus” products</p>
          <p className="text-xs text-amber-800/90">
            Pick which rotating hero slides should show this product in the spotlight card. You can choose more
            than one. Sort order applies within each slide’s carousel (lower = earlier).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HOME_HERO_BANNER_SLIDES.map((slide) => (
              <label
                key={slide.id}
                className="flex items-start gap-2 rounded-md border border-amber-200/80 bg-white/80 px-3 py-2 cursor-pointer hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={form.homeBannerSlideIds.includes(slide.id)}
                  onChange={() => {
                    setForm((prev) => {
                      const set = new Set(prev.homeBannerSlideIds);
                      if (set.has(slide.id)) set.delete(slide.id);
                      else set.add(slide.id);
                      return {
                        ...prev,
                        homeBannerSlideIds: Array.from(set).sort(
                          (a, b) => parseInt(a, 10) - parseInt(b, 10)
                        ),
                      };
                    });
                  }}
                  className="mt-0.5 h-4 w-4 text-teal-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-800">
                  <span className="font-medium text-amber-950">{slide.label}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label htmlFor="bannerSortOrder" className="text-sm text-gray-700 whitespace-nowrap">
              Sort order (0–999)
            </label>
            <input
              id="bannerSortOrder"
              name="bannerSortOrder"
              type="number"
              min={0}
              max={999}
              value={form.bannerSortOrder}
              onChange={handleChange}
              className="w-24 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Short description</label>
        <textarea
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
          rows={2}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full description</label>
        <RichTextEditor
          value={form.description}
          onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Product images</label>
          <p className="text-xs text-gray-600 mb-3">
            First image is the main photo on cards and galleries. Upload multiple files at once, or paste URLs
            below. Files are stored on the server under <code className="text-gray-800">/uploads/</code>.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            multiple
            className="hidden"
            onChange={handleImageFiles}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-teal-600 bg-white text-teal-700 text-sm font-medium hover:bg-teal-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploadingImages ? 'Uploading…' : 'Upload images'}
          </button>
        </div>

        {imageUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg bg-white">
            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p>No images yet. Upload files or add a URL row.</p>
            <button
              type="button"
              onClick={() => setImageUrls([''])}
              className="mt-3 text-teal-600 font-medium hover:underline"
            >
              Add image URL
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {imageUrls.map((url, i) => (
              <li
                key={`${i}-${url.slice(0, 24)}`}
                className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white"
              >
                <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  {url.trim() ? (
                    <img
                      src={resolveMediaUrl(url)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">—</div>
                  )}
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateImageUrlAt(i, e.target.value)}
                  placeholder="/images/... or https://..."
                  className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move up"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === imageUrls.length - 1}
                    className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeImageAt(i)}
                    className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setImageUrls((prev) => [...prev, ''])}
          className="text-sm font-medium text-teal-600 hover:underline"
        >
          + Add another image URL
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube videos</label>
        <p className="text-xs text-gray-500 mb-2">
          One link per line (watch, embed, Shorts, or youtu.be). Shown on the product page; clicking opens the
          video in a player.
        </p>
        <textarea
          name="youtubeLinks"
          value={form.youtubeLinks}
          onChange={handleChange}
          rows={3}
          placeholder="https://www.youtube.com/watch?v=…"
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features (one per line)
          </label>
          <textarea
            name="features"
            value={form.features}
            onChange={handleChange}
            rows={4}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specifications (key: value per line)
          </label>
          <textarea
            name="specifications"
            value={form.specifications}
            onChange={handleChange}
            rows={4}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO title</label>
          <input
            name="seoTitle"
            value={form.seoTitle}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO keywords</label>
          <input
            name="seoKeywords"
            value={form.seoKeywords}
            onChange={handleChange}
            placeholder="comma, separated, keywords"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SEO description</label>
        <textarea
          name="seoDescription"
          value={form.seoDescription}
          onChange={handleChange}
          rows={3}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 rounded-md bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save changes' : 'Create product'}
        </button>
      </div>

      {/* Brand quick-add modal */}
      {showBrandModal && (
        <MasterQuickAddModal
          title="Add Brand"
          onClose={() => setShowBrandModal(false)}
          onCreated={async (id, name) => {
            setForm((prev) => ({ ...prev, brand: id }));
            setShowBrandModal(false);
            try {
              const { data } = await api.get('/content/brands');
              setBrandOptions(
                (data || []).map((b: any) => ({
                  id: b.slug || b.id,
                  name: b.name
                }))
              );
            } catch {
              // ignore
            }
          }}
          endpoint="/content/brands"
        />
      )}

      {/* Category quick-add modal */}
      {showCategoryModal && (
        <MasterQuickAddModal
          title="Add Category"
          onClose={() => setShowCategoryModal(false)}
          onCreated={async (id, name) => {
            setForm((prev) => ({ ...prev, category: id }));
            setShowCategoryModal(false);
            try {
              const { data } = await api.get('/content/categories');
              setCategoryOptions(
                (data || []).map((c: any) => ({
                  id: c.slug || c.id,
                  name: c.name
                }))
              );
            } catch {
              // ignore
            }
          }}
          endpoint="/content/categories"
        />
      )}
    </form>
  );
}

interface MasterQuickAddModalProps {
  title: string;
  endpoint: string;
  onClose: () => void;
  onCreated: (id: string, name: string) => void | Promise<void>;
}

function MasterQuickAddModal({ title, endpoint, onClose, onCreated }: MasterQuickAddModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Let backend generate UUID - don't include id
      const response = await api.post(endpoint, {
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        is_active: true
      });
      // Backend returns the generated ID
      const generatedId = response.data?.id || response.data?.slug || slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-');
      await onCreated(generatedId, name.trim());
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
        {error && (
          <div className="mb-3 p-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if left blank"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


