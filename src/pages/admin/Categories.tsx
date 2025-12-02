import React, { useState, useEffect } from 'react';
import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/content/categories');
        setCategories(data);
        // Create a map of category id -> name for quick lookup
        const map: Record<string, string> = {};
        data.forEach((cat: any) => {
          map[cat.id] = cat.name;
        });
        setCategoryMap(map);
      } catch (error) {
        // Ignore errors, will show IDs if lookup fails
      }
    };

    const fetchBrands = async () => {
      try {
        const { data } = await api.get('/content/brands');
        // Create a map of brand id -> name for quick lookup
        const map: Record<string, string> = {};
        data.forEach((brand: any) => {
          map[brand.id] = brand.name;
        });
        setBrandMap(map);
      } catch (error) {
        // Ignore errors
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  return (
    <AdminLayout title="Categories">
      <ContentManager
        title="Categories"
        basePath="/admin/categories"
        apiEndpoint="/content/categories"
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
          {
            key: 'parent_id',
            label: 'Parent',
            render: (value) => {
              if (!value) return <span className="text-gray-400">-</span>;
              const parentName = categoryMap[value];
              return parentName ? (
                <span className="text-gray-900">{parentName}</span>
              ) : (
                <span className="text-gray-400 text-xs">{value}</span>
              );
            }
          },
          {
            key: 'brands',
            label: 'Brands',
            render: (value, item) => {
              if (!value || !Array.isArray(value) || value.length === 0) {
                return <span className="text-gray-400">-</span>;
              }
              return (
                <div className="flex flex-wrap gap-1">
                  {value.slice(0, 3).map((brandId: string) => {
                    const brandName = brandMap[brandId];
                    return (
                      <span
                        key={brandId}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {brandName || brandId}
                      </span>
                    );
                  })}
                  {value.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{value.length - 3}
                    </span>
                  )}
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
        searchFields={['name', 'type', 'description', 'short_description']}
      />
    </AdminLayout>
  );
}


