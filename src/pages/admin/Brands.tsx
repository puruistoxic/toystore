import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminBrands() {

  return (
    <AdminLayout title="Brands">
      <ContentManager
        title="Brands"
        basePath="/admin/brands"
        apiEndpoint="/content/brands"
        fields={[
          { key: 'name', label: 'Name' },
          {
            key: 'partnership_type',
            label: 'Partnership',
            render: (value) => {
              if (!value) return <span className="text-gray-400">-</span>;
              const labels: Record<string, string> = {
                'authorized-dealer': 'Authorized Dealer',
                'partner': 'Partner',
                'distributor': 'Distributor',
                'reseller': 'Reseller',
                'others': 'Others'
              };
              return (
                <span className="text-gray-900">
                  {labels[value] || value}
                </span>
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
        searchFields={['name', 'description']}
      />
    </AdminLayout>
  );
}

