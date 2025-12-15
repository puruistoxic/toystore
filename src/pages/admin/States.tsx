import React, { useEffect, useMemo, useState } from 'react';
import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

interface Country {
  code: string;
  name: string;
}

export default function AdminStates() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await api.get('/content/countries');
        setCountries(response.data || []);
      } catch (error) {
        console.error('[AdminStates] Failed to load countries', error);
      }
    };

    loadCountries();
  }, []);

  const statesEndpoint = useMemo(
    () =>
      selectedCountryCode
        ? `/content/states?country_code=${encodeURIComponent(selectedCountryCode)}`
        : '/content/states',
    [selectedCountryCode]
  );

  return (
    <AdminLayout title="States">
      <ContentManager
        title="States"
        basePath="/admin/states"
        apiEndpoint={statesEndpoint}
        fields={[
          { key: 'country_code', label: 'Country Code' },
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
          {
            key: 'is_active',
            label: 'Status',
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value ? 'Active' : 'Inactive'}
              </span>
            )
          }
        ]}
        searchFields={['name', 'country_code', 'slug']}
        itemFilter={(item) =>
          !selectedCountryCode || item.country_code === selectedCountryCode
        }
        filters={
          <select
            value={selectedCountryCode}
            onChange={(e) => setSelectedCountryCode(e.target.value)}
            className="block w-full sm:w-60 border border-gray-300 rounded-lg py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">All countries</option>
            {countries
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
          </select>
        }
      />
    </AdminLayout>
  );
}

