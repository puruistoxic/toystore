import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { generateSlug } from '../../utils/seo';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import {
  generateSEOTitle,
  generateSEODescription,
  generateSEOKeywords
} from '../../utils/seoHelper';

interface BrandFormProps {
  brandId?: string;
}

interface BrandFormState {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  logoUrl: string;
  localLogo: string;
  website: string;
  partnershipType: string;
  partnershipSince: string;
  certifications: string;
  features: string;
  warranty: string;
  support: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isActive: boolean;
}

const emptyState: BrandFormState = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  logoUrl: '',
  localLogo: '',
  website: '',
  partnershipType: '',
  partnershipSince: '',
  certifications: '',
  features: '',
  warranty: '',
  support: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isActive: true
};

export default function BrandForm({ brandId }: BrandFormProps) {
  const isEdit = !!brandId;
  const [form, setForm] = useState<BrandFormState>(emptyState);
  const [originalSlug, setOriginalSlug] = useState<string>(''); // Track original slug for redirects
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [allBrands, setAllBrands] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    const fetchBrand = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/content/brands/${brandId}`);

        const slug = data.slug || '';
        setForm({
          name: data.name || '',
          slug: slug,
          shortDescription: data.short_description || '',
          description: data.description || '',
          logoUrl: data.logo_url || '',
          localLogo: data.local_logo || '',
          website: data.website || '',
          partnershipType: data.partnership_type || '',
          partnershipSince: data.partnership_since || '',
          certifications: Array.isArray(data.certifications) ? data.certifications.join('\n') : '',
          features: Array.isArray(data.features) ? data.features.join('\n') : '',
          warranty: data.warranty || '',
          support: data.support || '',
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : '',
          isActive: data.is_active !== false
        });
        setOriginalSlug(slug); // Store original slug for redirect tracking
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load brand');
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [isEdit, brandId]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const { data } = await api.get('/content/brands');
        setAllBrands(
          (data || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug
          }))
        );
      } catch {
        // ignore
      }
    };

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
      const updated: BrandFormState = {
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
              const duplicate = allBrands.find(
                (b) => b.slug.toLowerCase() === trimmedSlug.toLowerCase() && b.id !== brandId
              );
              if (duplicate) {
                setSlugError('This brand slug already exists');
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
          const duplicate = allBrands.find(
            (b) => b.name.toLowerCase() === trimmedName.toLowerCase() && b.id !== brandId
          );
          if (duplicate) {
            setNameError('This brand name already exists');
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
          const duplicate = allBrands.find(
            (b) => b.slug.toLowerCase() === trimmedSlug.toLowerCase() && b.id !== brandId
          );
          if (duplicate) {
            setSlugError('This brand slug already exists');
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
          'brand'
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
      setError('Brand name is required');
      setSaving(false);
      return;
    }

    if (!form.slug.trim()) {
      setError('Brand slug is required');
      setSaving(false);
      return;
    }

    // Check for duplicates before submitting
    const nameDuplicate = allBrands.find(
      (b) => b.name.toLowerCase() === form.name.trim().toLowerCase() && b.id !== brandId
    );
    if (nameDuplicate) {
      setNameError('This brand name already exists');
      setError('Please fix the errors above');
      setSaving(false);
      return;
    }

    const slugDuplicate = allBrands.find(
      (b) => b.slug.toLowerCase() === form.slug.trim().toLowerCase() && b.id !== brandId
    );
    if (slugDuplicate) {
      setSlugError('This brand slug already exists');
      setError('Please fix the errors above');
      setSaving(false);
      return;
    }

    try {
      const certificationsArray =
        form.certifications
          .split('\n')
          .map((c) => c.trim())
          .filter(Boolean) || [];

      const featuresArray =
        form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean) || [];

      const seoKeywordsArray =
        form.seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean) || [];

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        short_description: form.shortDescription.trim(),
        logo_url: form.logoUrl.trim() || null,
        local_logo: form.localLogo.trim() || null,
        website: form.website.trim() || null,
        products: [],
        services: [],
        partnership_type: form.partnershipType || null,
        partnership_since: form.partnershipSince || null,
        certifications: certificationsArray,
        image: form.logoUrl.trim() || null, // Use logo_url as image
        features: featuresArray,
        warranty: form.warranty.trim() || null,
        support: form.support.trim() || null,
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
        await api.put(`/content/brands/${brandId}`, payload);
      } else {
        // Backend will generate the ID
        await api.post('/content/brands', payload);
      }

      navigate('/admin/brands');
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || 'Failed to save brand';
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
          <p className="mt-4 text-gray-600 text-sm">Loading brand...</p>
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
        <div className="flex items-center space-x-2 mt-6 md:mt-8">
          <input
            id="brandIsActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label htmlFor="brandIsActive" className="text-sm text-gray-700">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo (optional)</label>
          <ImageUpload
            value={form.logoUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
            label=""
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Local logo path</label>
          <input
            name="localLogo"
            value={form.localLogo}
            onChange={handleChange}
            placeholder="/images/brands/brand.png"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            type="url"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Partnership type</label>
          <select
            name="partnershipType"
            value={form.partnershipType}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Select type</option>
            <option value="authorized-dealer">Authorized Dealer</option>
            <option value="partner">Partner</option>
            <option value="distributor">Distributor</option>
            <option value="reseller">Reseller</option>
            <option value="others">Others</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partnership since (year or date)
          </label>
          <input
            name="partnershipSince"
            value={form.partnershipSince}
            onChange={handleChange}
            placeholder="e.g. 2018"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (one per line)
          </label>
          <textarea
            name="certifications"
            value={form.certifications}
            onChange={handleChange}
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key features (one per line)
        </label>
        <textarea
          name="features"
          value={form.features}
          onChange={handleChange}
          rows={3}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty summary</label>
          <input
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Support details</label>
          <input
            name="support"
            value={form.support}
            onChange={handleChange}
            placeholder="e.g. 24/7 phone & email support"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
        
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
              rows={3}
              maxLength={160}
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
                    'brand'
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
          {saving ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save changes' : 'Create brand'}
        </button>
      </div>

    </form>
  );
}
