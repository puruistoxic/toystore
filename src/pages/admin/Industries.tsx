import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminIndustries() {
  return (
    <AdminLayout title="Industries">
      <ContentManager
        title="Industries"
        basePath="/admin/industries"
        apiEndpoint="/content/industries"
        fields={[
          { key: 'name', label: 'Name' },
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
        searchFields={['name', 'description']}
      />
    </AdminLayout>
  );
}

