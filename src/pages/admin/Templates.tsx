import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminTemplates() {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'warranty': 'Warranty',
      'payment': 'Payment Terms',
      'notes': 'Notes',
      'terms': 'Terms & Conditions',
      'work_completion': 'Work Completion'
    };
    return labels[category] || category;
  };

  return (
    <AdminLayout title="Templates">
      <ContentManager
        title="Templates"
        basePath="/admin/templates"
        apiEndpoint="/content/templates"
        fields={[
          { key: 'name', label: 'Name' },
          {
            key: 'category',
            label: 'Category',
            render: (value) => (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getCategoryLabel(value)}
              </span>
            )
          },
          {
            key: 'content',
            label: 'Content Preview',
            render: (value) => {
              // Strip HTML tags for preview
              const textContent = value ? String(value).replace(/<[^>]*>/g, '').trim() : '';
              const preview = textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
              return (
                <div className="max-w-md">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {preview || '-'}
                  </p>
                </div>
              );
            }
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
        searchFields={['name', 'content', 'category']}
      />
    </AdminLayout>
  );
}

