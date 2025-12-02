import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminLocalities() {
  return (
    <AdminLayout title="Localities">
      <ContentManager
        title="Localities"
        basePath="/admin/localities"
        apiEndpoint="/content/localities"
        fields={[
          { key: 'state_id', label: 'State ID' },
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
          { key: 'type', label: 'Type' },
          { key: 'postal_code', label: 'PIN' },
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
        searchFields={['name', 'state_id', 'slug', 'postal_code']}
      />
    </AdminLayout>
  );
}


