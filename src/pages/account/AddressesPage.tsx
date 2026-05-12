import React, { useCallback, useEffect, useState } from 'react';
import { Edit3, Home, MapPin, Plus, Star, Trash2, X } from 'lucide-react';
import customerApi from '../../utils/customerApi';
import StateAutocomplete from '../../components/StateAutocomplete';
import { CustomerAddress } from './accountTypes';

type AddressForm = {
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const EMPTY: AddressForm = {
  label: '',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
};

const REQUIRED_FIELDS: Array<keyof AddressForm> = [
  'full_name',
  'phone',
  'line1',
  'city',
  'state',
  'postal_code',
];

function addressToForm(a: CustomerAddress): AddressForm {
  return {
    label: a.label || '',
    full_name: a.full_name,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 || '',
    landmark: a.landmark || '',
    city: a.city,
    state: a.state,
    postal_code: a.postal_code,
    country: a.country,
    is_default: Boolean(a.is_default),
  };
}

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerApi.get<{ addresses: CustomerAddress[] }>(
        '/customer/auth/addresses',
      );
      setAddresses(res.data.addresses || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openCreate = () => {
    setError(null);
    setEditing(null);
    setCreating(true);
    setForm({ ...EMPTY, is_default: addresses.length === 0 });
  };

  const openEdit = (a: CustomerAddress) => {
    setError(null);
    setCreating(false);
    setEditing(a);
    setForm(addressToForm(a));
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setError(null);
  };

  const handleChange = (key: keyof AddressForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): string | null => {
    for (const k of REQUIRED_FIELDS) {
      if (!String(form[k]).trim()) {
        return `${k.replace('_', ' ')} is required`;
      }
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return 'Enter a valid 10-digit phone number';
    if (!/^[0-9]{5,8}$/.test(form.postal_code.replace(/\s+/g, ''))) {
      return 'Enter a valid postal code';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (editing) {
        await customerApi.patch(`/customer/auth/addresses/${editing.id}`, form);
      } else {
        await customerApi.post('/customer/auth/addresses', form);
      }
      await fetchAddresses();
      closeForm();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not save address.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (a: CustomerAddress) => {
    if (!window.confirm(`Delete this address? This cannot be undone.`)) return;
    try {
      await customerApi.delete(`/customer/auth/addresses/${a.id}`);
      await fetchAddresses();
    } catch (err: unknown) {
      window.alert(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not delete address.',
      );
    }
  };

  const handleSetDefault = async (a: CustomerAddress) => {
    try {
      await customerApi.patch(`/customer/auth/addresses/${a.id}`, { is_default: true });
      await fetchAddresses();
    } catch {
      /* swallow */
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">
            Saved addresses
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Add the addresses you ship to often — checkout will prefill from these.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-gray-900">
              {editing ? 'Edit address' : 'New address'}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Label (optional)" hint="e.g. Home, Office">
              <input
                type="text"
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Home"
                maxLength={50}
              />
            </Field>
            <Field label="Full name" required>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={INPUT_CLASS}
                required
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={INPUT_CLASS}
                inputMode="tel"
                required
              />
            </Field>
            <Field label="Pincode" required>
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className={INPUT_CLASS}
                inputMode="numeric"
                required
              />
            </Field>
            <Field label="Address line 1" required wide>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => handleChange('line1', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Flat / House no, Building, Street"
                required
              />
            </Field>
            <Field label="Address line 2 (optional)" wide>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => handleChange('line2', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Area, Sector"
              />
            </Field>
            <Field label="Landmark (optional)">
              <input
                type="text"
                value={form.landmark}
                onChange={(e) => handleChange('landmark', e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="City" required>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={INPUT_CLASS}
                required
              />
            </Field>
            <Field label="State" required>
              <StateAutocomplete
                value={form.state}
                onChange={(v) => handleChange('state', v)}
                countryCode={form.country === 'India' ? 'IN' : undefined}
              />
            </Field>
            <Field label="Country">
              <input
                type="text"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => handleChange('is_default', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Set as default delivery address
          </label>

          <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add address'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-14 px-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
            <MapPin className="h-7 w-7" />
          </div>
          <p className="text-gray-900 font-display font-bold text-lg mb-1">
            No saved addresses yet
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Add an address to skip filling it in every time you place an order.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="rounded-xl bg-primary-50 text-primary-700 p-2 shrink-0">
                  <Home className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-display font-bold text-gray-900">
                      {a.label || 'Address'}
                    </h3>
                    {Boolean(a.is_default) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {a.full_name} · <span className="text-gray-500">{a.phone}</span>
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed flex-1">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ''}
                {a.landmark ? `, ${a.landmark}` : ''}
                <br />
                {a.city}, {a.state} {a.postal_code}
                <br />
                {a.country}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(a)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, required, hint, wide, children }) => (
  <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="block text-xs font-semibold text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </span>
    {children}
    {hint && <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>}
  </label>
);

export default AddressesPage;
