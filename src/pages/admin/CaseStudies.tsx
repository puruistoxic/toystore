import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminCaseStudies() {
  return (
    <AdminLayout title="Case Studies">
      <ContentManager
        title="Case Studies"
        basePath="/admin/case-studies"
        apiEndpoint="/content/case-studies"
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'industry', label: 'Industry' },
          { key: 'location', label: 'Location' },
          {
            key: 'featured',
            label: 'Featured',
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value ? 'Yes' : 'No'}
              </span>
            )
          },
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
        searchFields={['title', 'industry', 'location', 'description']}
      />
    </AdminLayout>
  );
}

