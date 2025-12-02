import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminStates() {
  return (
    <AdminLayout title="States">
      <ContentManager
        title="States"
        basePath="/admin/states"
        apiEndpoint="/content/states"
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
      />
    </AdminLayout>
  );
}


