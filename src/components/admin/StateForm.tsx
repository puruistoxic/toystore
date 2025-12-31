import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { generateSlug } from '../../utils/seo';

interface StateFormProps {
  stateId?: string;
}

interface StateFormState {
  country_code: string;
  name: string;
  slug: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

interface CountryOption {
  code: string;
  name: string;
}

const emptyState: StateFormState = {
  country_code: '',
  name: '',
  slug: '',
  latitude: '',
  longitude: '',
  is_active: true
};

export default function StateForm({ stateId }: StateFormProps) {
  const isEdit = !!stateId;
  const [form, setForm] = useState<StateFormState>(emptyState);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const { data } = await api.get('/content/countries');
        setCountries(
          (data || []).map((c: any) => ({
            code: c.code,
            name: c.name
          }))
        );
      } catch {
        // ignore; dropdown will just be empty
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!isEdit || !stateId) return;

    const fetchState = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/content/states/${stateId}`);
        setForm({
          country_code: data.country_code || '',
          name: data.name || '',
          slug: data.slug || '',
          latitude: data.latitude != null ? String(data.latitude) : '',
          longitude: data.longitude != null ? String(data.longitude) : '',
          is_active: data.is_active !== false
        });
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load state');
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [isEdit, stateId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;

    setForm((prev) => {
      const isCheckbox =
        (target as HTMLInputElement).type === 'checkbox';

      const updated: StateFormState = {
        ...prev,
        [name]: isCheckbox ? (target as HTMLInputElement).checked : value
      } as StateFormState;

      if (name === 'name' && !isEdit) {
        // Auto-generate slug when creating
        if (!prev.slug || prev.slug === generateSlug(prev.name)) {
          updated.slug = generateSlug(value);
        }
      }

      if (name === 'slug' && !isEdit) {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.country_code) {
      setError('Country is required');
      setSaving(false);
      return;
    }

    if (!form.name.trim()) {
      setError('State name is required');
      setSaving(false);
      return;
    }

    const payload: any = {
      country_code: form.country_code,
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      is_active: form.is_active
    };

    if (isEdit && stateId) {
      payload.id = stateId;
    }

    try {
      await api.post('/content/states', payload);
      navigate('/admin/states');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save state');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Loading state...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country_code"
            value={form.country_code}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
          >
            <option value="">Select country</option>
            {countries
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
            placeholder="e.g. Jharkhand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
            placeholder="auto-generated-from-name"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used in URLs. Leave empty to auto-generate from the name.
          </p>
        </div>

        <div className="flex items-center mt-6">
          <input
            id="is_active"
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            step="0.000001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            step="0.000001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/admin/states')}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEdit ? 'Update State' : 'Create State'}
        </button>
      </div>
    </form>
  );
}











