import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import RichTextEditor from './RichTextEditor';

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
  mainImage: string;
  galleryImages: string; // one URL per line
  features: string; // one feature per line
  specifications: string; // key: value per line
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string; // comma-separated
  isActive: boolean;
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
  mainImage: '',
  galleryImages: '',
  features: '',
  specifications: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isActive: true
};

export default function ProductForm({ productId }: ProductFormProps) {
  const isEdit = !!productId;
  const [form, setForm] = useState<ProductFormState>(emptyState);
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
          mainImage: data.image || '',
          galleryImages: Array.isArray(data.images) ? data.images.join('\n') : '',
          features: Array.isArray(data.features) ? data.features.join('\n') : '',
          specifications: data.specifications
            ? Object.entries(data.specifications)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')
            : '',
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : '',
          isActive: data.is_active !== false
        });
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

      const imagesArray =
        form.galleryImages
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
        image: form.mainImage.trim() || null,
        images: imagesArray,
        features: featuresArray,
        specifications: specs,
        warranty: null,
        seo_title: form.seoTitle.trim() || null,
        seo_description: form.seoDescription.trim() || null,
        seo_keywords: seoKeywordsArray,
        is_active: form.isActive
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
            placeholder="e.g., 8528, 8526"
            maxLength={20}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            HSN (Harmonized System of Nomenclature) code required for GST invoicing. Common codes: 8528 (CCTV/Video equipment), 8526 (GPS devices), 8531 (Security systems)
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main image URL</label>
          <input
            name="mainImage"
            value={form.mainImage}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gallery image URLs (one per line)
          </label>
          <textarea
            name="galleryImages"
            value={form.galleryImages}
            onChange={handleChange}
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
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


