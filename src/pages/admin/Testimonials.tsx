import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminTestimonials() {
  return (
    <AdminLayout title="Testimonials">
      <ContentManager
        title="Testimonials"
        basePath="/admin/testimonials"
        apiEndpoint="/content/testimonials"
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'company', label: 'Company' },
          {
            key: 'rating',
            label: 'Rating',
            render: (value) => (
              <span className="text-yellow-500">
                {'★'.repeat(value)}
                {'☆'.repeat(5 - value)}
              </span>
            )
          },
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
            key: 'verified',
            label: 'Verified',
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value ? 'Yes' : 'No'}
              </span>
            )
          }
        ]}
        searchFields={['name', 'company', 'review']}
      />
    </AdminLayout>
  );
}

