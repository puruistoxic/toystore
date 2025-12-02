import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminLocations() {
  return (
    <AdminLayout title="Locations">
      <ContentManager
        title="Locations"
        basePath="/admin/locations"
        apiEndpoint="/content/locations"
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
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
        searchFields={['name', 'state', 'country', 'description']}
      />
    </AdminLayout>
  );
}

