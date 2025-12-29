import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import RichTextEditor from './RichTextEditor';
import { ArrowLeft } from 'lucide-react';

interface TemplateFormState {
  name: string;
  category: 'warranty' | 'payment' | 'notes' | 'terms' | 'work_completion';
  content: string;
  is_active: boolean;
}

const emptyState: TemplateFormState = {
  name: '',
  category: 'warranty',
  content: '',
  is_active: true
};

export default function TemplateForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form, setForm] = useState<TemplateFormState>(emptyState);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        // Encode the ID to handle special characters
        const encodedId = encodeURIComponent(id!);
        const { data } = await api.get(`/content/templates/${encodedId}`);
        setForm({
          name: data.name || '',
          category: data.category || 'warranty',
          content: data.content || '',
          is_active: data.is_active !== false
        });
      } catch (e: any) {
        console.error('Failed to load template:', e);
        setError(e.response?.data?.error || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isEdit) {
        // Encode the ID to handle special characters
        const encodedId = encodeURIComponent(id!);
        const response = await api.put(`/content/templates/${encodedId}`, form);
        console.log('Update response:', response.data);
      } else {
        await api.post('/content/templates', form);
      }
      navigate('/admin/templates');
    } catch (e: any) {
      console.error('Template update error:', e);
      console.error('Error response:', e.response?.data);
      const errorMessage = e.response?.data?.error || e.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} template`;
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TemplateFormState, value: any) => {
    setForm({ ...form, [field]: value });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="mt-2 text-gray-600">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/templates')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Templates
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="e.g., Standard Electronics Warranty"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="warranty">Warranty Details</option>
            <option value="payment">Payment Terms</option>
            <option value="notes">Notes</option>
            <option value="terms">Terms & Conditions</option>
            <option value="work_completion">Work Completion Period</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          {form.category === 'work_completion' ? (
            <input
              type="text"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., 15-30 working days after advance payment"
            />
          ) : (
            <RichTextEditor
              value={form.content}
              onChange={(content) => handleChange('content', content)}
              id="template-content-editor"
              height={300}
            />
          )}
          <p className="mt-2 text-xs text-gray-500">
            {form.category === 'work_completion' 
              ? 'Enter the work completion period as a single line of text.'
              : 'Use the rich text editor to format your template content. You can use numbered lists, bullet points, and formatting.'}
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active (template will be available for selection)
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/templates')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {saving ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Template' : 'Create Template')}
          </button>
        </div>
      </form>
    </div>
  );
}

