import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { companySettingsApi } from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';
import {
  Building2,
  Save,
  Phone,
  Scale,
  Landmark,
  MapPin,
  Globe,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  parseServicePincodesJson,
  parseServicePincodesText,
  servicePincodesToText,
} from '../../utils/servicePincodes';

type TabId = 'company' | 'contact' | 'tax' | 'bank' | 'storefront' | 'legal';

const TABS: Array<{
  id: TabId;
  label: string;
  short: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'company',
    label: 'Company & address',
    short: 'Company',
    description: 'Legal name, logo, and postal address on documents.',
    Icon: Building2,
  },
  {
    id: 'contact',
    label: 'Contact',
    short: 'Contact',
    description: 'Phones, email, and public website URL.',
    Icon: Phone,
  },
  {
    id: 'tax',
    label: 'Tax & IDs',
    short: 'Tax',
    description: 'GSTIN and PAN for invoices and compliance.',
    Icon: Scale,
  },
  {
    id: 'bank',
    label: 'Bank',
    short: 'Bank',
    description: 'Account details shown on invoices and receipts.',
    Icon: Landmark,
  },
  {
    id: 'storefront',
    label: 'Storefront',
    short: 'Store',
    description: 'Delivery pincodes, enquiry popup, and WhatsApp.',
    Icon: MapPin,
  },
  {
    id: 'legal',
    label: 'Footer & terms',
    short: 'Legal',
    description: 'Footer line and default terms on proposals.',
    Icon: FileText,
  },
];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function CompanySettings() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabId>('company');

  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    address_line1: '',
    address_line2: '',
    address_line3: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    gstin: '',
    pan: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_branch: '',
    footer_text: '',
    terms_and_conditions: '',
    enable_enquiry_popup: true,
    whatsapp_number: '',
    service_pincodes_text: '',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const response = await companySettingsApi.getSettings();
      return response.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        logo_url: settings.logo_url || '',
        address_line1: settings.address_line1 || '',
        address_line2: settings.address_line2 || '',
        address_line3: settings.address_line3 || '',
        city: settings.city || '',
        state: settings.state || '',
        postal_code: settings.postal_code || '',
        country: settings.country || 'India',
        phone: settings.phone || '',
        phone2: settings.phone2 || '',
        email: settings.email || '',
        website: settings.website || '',
        gstin: settings.gstin || '',
        pan: settings.pan || '',
        bank_name: settings.bank_name || '',
        bank_account_name: settings.bank_account_name || '',
        bank_account_number: settings.bank_account_number || '',
        bank_ifsc: settings.bank_ifsc || '',
        bank_branch: settings.bank_branch || '',
        footer_text: settings.footer_text || '',
        terms_and_conditions: settings.terms_and_conditions || '',
        enable_enquiry_popup: settings.enable_enquiry_popup !== undefined ? settings.enable_enquiry_popup : true,
        whatsapp_number: settings.whatsapp_number || '',
        service_pincodes_text: servicePincodesToText(
          parseServicePincodesJson((settings as { service_pincodes_json?: unknown }).service_pincodes_json),
        ),
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => companySettingsApi.updateSettings(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      queryClient.invalidateQueries({ queryKey: ['company-settings-public'] });
      localStorage.removeItem('company_settings_cache');
      await showAlert({
        type: 'success',
        title: 'Saved',
        message: 'Company settings were updated. Public pages will pick up changes shortly.',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const service_pincodes_json = JSON.stringify(parseServicePincodesText(formData.service_pincodes_text));
      const { service_pincodes_text: _t, ...rest } = formData;
      await updateMutation.mutateAsync({ ...rest, service_pincodes_json });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message || '')
          : '';
      await showAlert({
        type: 'error',
        title: 'Could not save',
        message: msg || 'Something went wrong while saving. Try again.',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Company settings">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 shadow-sm">
          <Loader2 className="h-9 w-9 animate-spin text-primary-600" />
          <p className="mt-3 text-sm text-gray-600">Loading settings…</p>
        </div>
      </AdminLayout>
    );
  }

  const tabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <AdminLayout title="Company settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Company settings</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Configure branding, contact, tax, banking, storefront rules, and legal text used on invoices and
              proposals.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[420px]"
        >
          {/* Tab bar */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-2 pt-2 pb-0 sm:px-4">
            <div
              role="tablist"
              aria-label="Settings sections"
              className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1"
            >
              {TABS.map((tab) => {
                const Icon = tab.Icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`tab-${tab.id}`}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors border ${
                      selected
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-90" />
                    <span>{tab.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active section header */}
          <div className="px-5 sm:px-6 pt-5 pb-0 border-b border-gray-50">
            <h3 className="text-lg font-display font-bold text-gray-900">{tabMeta.label}</h3>
            <p className="text-sm text-gray-500 mt-0.5 mb-4">{tabMeta.description}</p>
          </div>

          {/* Panels */}
          <div className="flex-1 px-5 sm:px-6 py-6">
            {activeTab === 'company' && (
              <div
                role="tabpanel"
                id="panel-company"
                aria-labelledby="tab-company"
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Company name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Logo URL</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address line 3</label>
                  <input
                    type="text"
                    name="address_line3"
                    value={formData.address_line3}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div role="tabpanel" id="panel-contact" aria-labelledby="tab-contact" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone 2</label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div role="tabpanel" id="panel-tax" aria-labelledby="tab-tax" className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                <div>
                  <label className={labelClass}>GSTIN</label>
                  <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>PAN</label>
                  <input type="text" name="pan" value={formData.pan} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div role="tabpanel" id="panel-bank" aria-labelledby="tab-bank" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Bank name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Account name</label>
                  <input
                    type="text"
                    name="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Account number</label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>IFSC code</label>
                  <input
                    type="text"
                    name="bank_ifsc"
                    value={formData.bank_ifsc}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Branch</label>
                  <input
                    type="text"
                    name="bank_branch"
                    value={formData.bank_branch}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {activeTab === 'storefront' && (
              <div role="tabpanel" id="panel-storefront" aria-labelledby="tab-storefront" className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery areas (pincodes)</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    When you list one or more pincodes, visitors must choose a served area before WhatsApp product
                    enquiries or multi-item cart requests. Leave empty to allow any pincode.
                  </p>
                  <textarea
                    name="service_pincodes_text"
                    value={formData.service_pincodes_text}
                    onChange={handleChange}
                    rows={6}
                    className={`${inputClass} font-mono text-sm resize-y min-h-[140px]`}
                    placeholder={'394101, Mota Varachha\n395007\n394105, Adajan'}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    One line each: six-digit pincode, optional comma and short label.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-5">
                  <h4 className="text-sm font-semibold text-gray-900">Website behaviour</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <label htmlFor="enable_enquiry_popup" className="block text-sm font-medium text-gray-900">
                        Enquiry popup
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">Show the lead capture popup to new visitors.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        id="enable_enquiry_popup"
                        name="enable_enquiry_popup"
                        checked={formData.enable_enquiry_popup}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className={labelClass}>WhatsApp number (storefront)</label>
                    <input
                      type="text"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      placeholder="e.g. 919876543210 (digits only, country code included)"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      Used for product enquiries and quick-contact buttons. Digits only; include country code (e.g.
                      91…).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div role="tabpanel" id="panel-legal" aria-labelledby="tab-legal" className="space-y-6">
                <div>
                  <label className={labelClass}>Footer text</label>
                  <textarea
                    name="footer_text"
                    value={formData.footer_text}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="© 2024 Company Name. All rights reserved."
                  />
                </div>
                <div>
                  <label className={labelClass}>Terms &amp; conditions (default)</label>
                  <textarea
                    name="terms_and_conditions"
                    value={formData.terms_and_conditions}
                    onChange={handleChange}
                    rows={8}
                    className={inputClass}
                    placeholder="Default terms for invoices and proposals…"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky save */}
          <div className="border-t border-gray-100 bg-white/95 backdrop-blur-sm px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-500">
              Changes apply to invoices, proposals, and the live storefront after you save.
            </p>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-primary-600 text-white px-5 py-2.5 text-sm font-display font-bold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {updateMutation.isPending ? 'Saving…' : 'Save all settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
