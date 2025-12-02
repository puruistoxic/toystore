import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminCountries() {
  return (
    <AdminLayout title="Countries">
      <ContentManager
        title="Countries"
        basePath="/admin/countries"
        apiEndpoint="/content/countries"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'iso2', label: 'ISO2' },
          { key: 'iso3', label: 'ISO3' },
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
        searchFields={['code', 'name']}
      />
    </AdminLayout>
  );
}


