import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminProducts() {
  return (
    <AdminLayout title="Products">
      <ContentManager
        title="Products"
        basePath="/admin/products"
        apiEndpoint="/content/products"
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'brand', label: 'Brand' },
          { key: 'hsn_code', label: 'HSN Code' },
          {
            key: 'price',
            label: 'Price',
            render: (value) => (value ? `₹${value.toLocaleString()}` : '-')
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
        searchFields={['name', 'category', 'brand', 'description', 'hsn_code', 'model']}
      />
    </AdminLayout>
  );
}

