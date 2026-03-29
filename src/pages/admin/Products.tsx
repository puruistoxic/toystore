import ContentManager from '../../components/admin/ContentManager';
import AdminLayout from '../../components/admin/AdminLayout';
import { HOME_HERO_BANNER_IDS, HOME_HERO_BANNER_SLIDES } from '../../constants/homeHeroBanners';

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
          },
          {
            key: 'promote_home_banner',
            label: 'Hero slides',
            render: (_value, item) => {
              const raw = item.home_banner_slides;
              let ids: string[] = [];
              if (Array.isArray(raw)) ids = raw.map(String);
              else if (typeof raw === 'string') {
                try {
                  const j = JSON.parse(raw);
                  if (Array.isArray(j)) ids = j.map(String);
                } catch {
                  /* ignore */
                }
              }
              const allowed = new Set(HOME_HERO_BANNER_IDS);
              ids = ids.filter((id) => allowed.has(id));
              if (ids.length === 0 && item.promote_home_banner) {
                ids = [...HOME_HERO_BANNER_IDS];
              }
              if (ids.length === 0) {
                return <span className="text-gray-400 text-xs">—</span>;
              }
              const labels = ids
                .map((id) => HOME_HERO_BANNER_SLIDES.find((s) => s.id === id)?.shortLabel || id)
                .join(', ');
              return (
                <span
                  className="px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-900 max-w-[16rem] inline-block align-top leading-snug"
                  title={`${labels} · order ${item.banner_sort_order ?? 0}`}
                >
                  {labels}
                  <span className="text-amber-800/80 font-normal"> · #{item.banner_sort_order ?? 0}</span>
                </span>
              );
            },
          },
        ]}
        searchFields={['name', 'category', 'brand', 'description', 'hsn_code', 'model']}
      />
    </AdminLayout>
  );
}

