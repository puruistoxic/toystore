import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { generateSlug } from '../../utils/seo';
import IconPicker from './IconPicker';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import MasterQuickAddModal from './MasterQuickAddModal';
import {
  generateSEOTitle,
  generateSEODescription,
  generateSEOKeywords
} from '../../utils/seoHelper';

interface CategoryFormProps {
  categoryId?: string;
}

interface CategoryFormState {
  name: string;
  slug: string;
  type: 'service' | 'product' | 'both';
  parent_id: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isActive: boolean;
}

const emptyState: CategoryFormState = {
  name: '',
  slug: '',
  type: 'product',
  parent_id: '',
  shortDescription: '',
  description: '',
  icon: '',
  image: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isActive: true
};

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const isEdit = !!categoryId;
  const [form, setForm] = useState<CategoryFormState>(emptyState);
  const [originalSlug, setOriginalSlug] = useState<string>(''); // Track original slug for redirects
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [brandOptions, setBrandOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/content/categories/${categoryId}`);

        const slug = data.slug || '';
        setForm({
          name: data.name || '',
          slug: slug,
          type: data.type || 'product',
          parent_id: data.parent_id || '',
          shortDescription: data.short_description || '',
          description: data.description || '',
          icon: data.icon || '',
          image: data.image || '',
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : '',
          isActive: data.is_active !== false
        });
        // Load brands if they exist
        if (data.brands && Array.isArray(data.brands)) {
          setSelectedBrands(data.brands);
        }
        setOriginalSlug(slug); // Store original slug for redirect tracking
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [isEdit, categoryId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/content/categories');
        const categories = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug
        }));
        setCategoryOptions(categories);
        setAllCategories(categories);
      } catch {
        // ignore
      }
    };

    const loadBrands = async () => {
      try {
        const { data } = await api.get('/content/brands');
        setBrandOptions(
          (data || []).map((b: any) => ({
            id: b.id,
            name: b.name
          }))
        );
      } catch {
        // ignore
      }
    };

    loadCategories();
    loadBrands();
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

    setForm((prev) => {
      const updated: CategoryFormState = {
        ...prev,
        [name]: nextValue as any
      };

      // Auto-generate slug from name ONLY when creating new (not editing)
      if (name === 'name') {
        // Only auto-update slug if creating new OR if slug is empty
        if (!isEdit || !prev.slug) {
          const autoSlug = generateSlug(String(nextValue));
          if (!prev.slug || prev.slug === generateSlug(prev.name)) {
            updated.slug = autoSlug;
            
            // Check for duplicate slug when auto-generated
            const trimmedSlug = autoSlug.trim();
            if (trimmedSlug) {
              const duplicate = allCategories.find(
                (c) => c.slug.toLowerCase() === trimmedSlug.toLowerCase() && c.id !== categoryId
              );
              if (duplicate) {
                setSlugError('This category slug already exists');
              } else {
                setSlugError(null);
              }
            }
          }
        }
        // When editing, slug stays unchanged unless explicitly modified
        
        // Auto-generate SEO title if empty
        if (!prev.seoTitle) {
          updated.seoTitle = generateSEOTitle(String(nextValue));
        }
        
        // Check for duplicate name
        const trimmedName = String(nextValue).trim();
        if (trimmedName) {
          const duplicate = allCategories.find(
            (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== categoryId
          );
          if (duplicate) {
            setNameError('This category name already exists');
          } else {
            setNameError(null);
          }
        } else {
          setNameError(null);
        }
      }
      
      // Check for duplicate slug
      if (name === 'slug') {
        const trimmedSlug = String(nextValue).trim();
        if (trimmedSlug) {
          const duplicate = allCategories.find(
            (c) => c.slug.toLowerCase() === trimmedSlug.toLowerCase() && c.id !== categoryId
          );
          if (duplicate) {
            setSlugError('This category slug already exists');
          } else {
            setSlugError(null);
          }
        } else {
          setSlugError(null);
        }
      }

      // Auto-generate SEO description from short description
      if (name === 'shortDescription' && !prev.seoDescription) {
        updated.seoDescription = generateSEODescription(
          String(nextValue),
          prev.description
        );
      }

      // Auto-generate SEO keywords when name or description changes
      if ((name === 'name' || name === 'shortDescription' || name === 'description') && !prev.seoKeywords) {
        const keywords = generateSEOKeywords(
          updated.name,
          updated.description || updated.shortDescription,
          updated.type
        );
        updated.seoKeywords = keywords.join(', ');
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNameError(null);
    setSlugError(null);

    // Validate required fields
    if (!form.name.trim()) {
      setError('Category name is required');
      setSaving(false);
      return;
    }

    if (!form.slug.trim()) {
      setError('Category slug is required');
      setSaving(false);
      return;
    }

    // Check for duplicates before submitting
    const nameDuplicate = allCategories.find(
      (c) => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== categoryId
    );
    if (nameDuplicate) {
      setNameError('This category name already exists');
      setError('Please fix the errors above');
      setSaving(false);
      return;
    }

    const slugDuplicate = allCategories.find(
      (c) => c.slug.toLowerCase() === form.slug.trim().toLowerCase() && c.id !== categoryId
    );
    if (slugDuplicate) {
      setSlugError('This category slug already exists');
      setError('Please fix the errors above');
      setSaving(false);
      return;
    }

    try {
      const seoKeywordsArray =
        form.seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean) || [];

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        type: form.type,
        description: form.description.trim(),
        short_description: form.shortDescription.trim(),
        parent_id: form.parent_id.trim() || null,
        icon: form.icon.trim() || null,
        image: form.image.trim() || null,
        brands: selectedBrands.length > 0 ? selectedBrands : null,
        seo_title: form.seoTitle.trim() || null,
        seo_description: form.seoDescription.trim() || null,
        seo_keywords: seoKeywordsArray,
        is_active: form.isActive
      };

      if (isEdit) {
        // Include original slug for redirect creation if slug changed
        if (originalSlug && originalSlug !== form.slug.trim()) {
          (payload as any).original_slug = originalSlug;
        }
        await api.put(`/content/categories/${categoryId}`, payload);
      } else {
        // Backend will generate the ID
        await api.post('/content/categories', payload);
      }

      navigate('/admin/categories');
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || 'Failed to save category';
      const errorField = e.response?.data?.field;
      
      if (errorField === 'name') {
        setNameError(errorMessage);
      } else if (errorField === 'slug') {
        setSlugError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
          <p className="mt-4 text-gray-600 text-sm">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
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
            className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              nameError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {nameError && (
            <p className="mt-1 text-xs text-red-600">{nameError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              slugError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {slugError ? (
            <p className="mt-1 text-xs text-red-600">{slugError}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Auto-generated from name, but you can adjust if needed.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent category</label>
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">(Top-level category)</option>
            {categoryOptions
              .filter((c) => !categoryId || c.id !== categoryId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Leave blank for top-level; choose a parent to nest under an existing category.
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brands (optional)
          </label>
          <div className="flex gap-2">
            <select
              multiple
              value={selectedBrands}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedBrands(values);
              }}
              className="flex-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
              size={5}
            >
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowBrandModal(true)}
              className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium self-start"
            >
              + Add Brand
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select multiple brands that belong to this category. Hold Ctrl/Cmd to select multiple.
          </p>
          {selectedBrands.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedBrands.map((brandId) => {
                const brand = brandOptions.find(b => b.id === brandId);
                return brand ? (
                  <span
                    key={brandId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                  >
                    {brand.name}
                    <button
                      type="button"
                      onClick={() => setSelectedBrands(prev => prev.filter(id => id !== brandId))}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-6 md:mt-8">
          <input
            id="catIsActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label htmlFor="catIsActive" className="text-sm text-gray-700">
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
          <IconPicker
            value={form.icon}
            onChange={(iconName) => setForm((prev) => ({ ...prev, icon: iconName }))}
            label="Icon (optional)"
          />
        </div>
        <div>
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            label="Image (optional)"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">SEO Title</label>
              <button
                type="button"
                onClick={() => {
                  const autoTitle = generateSEOTitle(form.name);
                  setForm((prev) => ({ ...prev, seoTitle: autoTitle }));
                }}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Auto-generate
              </button>
            </div>
            <input
              name="seoTitle"
              value={form.seoTitle}
              onChange={handleChange}
              maxLength={60}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {form.seoTitle.length}/60 characters (recommended: 50-60)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">SEO Description</label>
              <button
                type="button"
                onClick={() => {
                  const autoDesc = generateSEODescription(form.shortDescription, form.description);
                  setForm((prev) => ({ ...prev, seoDescription: autoDesc }));
                }}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Auto-generate
              </button>
            </div>
            <textarea
              name="seoDescription"
              value={form.seoDescription}
              onChange={handleChange}
              maxLength={160}
              rows={3}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {form.seoDescription.length}/160 characters (recommended: 150-160)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
              <button
                type="button"
                onClick={() => {
                  const keywords = generateSEOKeywords(
                    form.name,
                    form.description || form.shortDescription,
                    form.type
                  );
                  setForm((prev) => ({ ...prev, seoKeywords: keywords.join(', ') }));
                }}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Auto-generate
              </button>
            </div>
            <input
              name="seoKeywords"
              value={form.seoKeywords}
              onChange={handleChange}
              placeholder="comma, separated, keywords"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated keywords (recommended: 5-10 keywords)
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 rounded-md bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save changes' : 'Create category'}
        </button>
      </div>

      {/* Brand Quick Add Modal */}
      {showBrandModal && (
        <MasterQuickAddModal
          title="Add New Brand"
          endpoint="/content/brands"
          onClose={() => setShowBrandModal(false)}
          onCreated={async (slug: string, name: string) => {
            // Reload brands to get the new one
            try {
              const { data } = await api.get('/content/brands');
              setBrandOptions(
                (data || []).map((b: any) => ({
                  id: b.id,
                  name: b.name
                }))
              );
              // Find the newly created brand by name and add it to selection
              const newBrand = data.find((b: any) => b.name === name);
              if (newBrand) {
                setSelectedBrands(prev => [...prev, newBrand.id]);
              }
            } catch {
              // ignore
            }
            setShowBrandModal(false);
          }}
        />
      )}
    </form>
  );
}


