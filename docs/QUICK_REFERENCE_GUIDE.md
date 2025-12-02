# Quick Reference Guide - Template System

## 🚀 Quick Start

### Adding a New Location Page
```typescript
// 1. Add to src/data/locations.ts
{
  id: '8',
  name: 'New City',
  slug: generateSlug('New City'),
  state: 'Jharkhand',
  country: 'India',
  description: '...',
  services: ['1', '2'],
  products: ['1', '2'],
  seo: { title: '...', description: '...', keywords: [...] }
}

// 2. Page automatically available at /locations/new-city
// No code changes needed!
```

### Adding a New Brand Page
```typescript
// 1. Add to src/data/brands.ts
{
  id: '9',
  name: 'New Brand',
  slug: generateSlug('New Brand'),
  category: 'cctv',
  // ... other fields
}

// 2. Page automatically available at /brands/new-brand
```

## 📁 File Locations

| Component | Location |
|-----------|----------|
| Templates | `src/components/templates/` |
| Data Files | `src/data/` |
| Page Components | `src/pages/` |
| Type Definitions | `src/types/content.ts` |
| Routes | `src/App.tsx` |

## 🔗 Available Routes

```
/                          → Home
/services                  → Services listing
/services/:slug            → Service detail
/products                  → Products listing
/products/:slug            → Product detail
/locations                 → Locations listing
/locations/:slug           → Location detail
/brands                    → Brands listing
/brands/:slug              → Brand detail
/industries                → Industries listing
/industries/:slug          → Industry detail
/case-studies              → Case studies listing
/case-studies/:slug        → Case study detail
/about                     → About page
/contact                   → Contact page
```

## 📊 Data Structure Quick Reference

### Location
```typescript
{
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  description: string;
  services: string[];      // Service IDs
  products: string[];      // Product IDs
  landmarks?: string[];
  coverageAreas?: string[];
  stats?: { projectsCompleted, customersServed, yearsActive };
  seo: { title, description, keywords };
}
```

### Brand
```typescript
{
  id: string;
  name: string;
  slug: string;
  category: 'cctv' | 'gps' | 'security' | ...;
  partnershipType: 'authorized-dealer' | 'partner' | ...;
  products: string[];      // Product IDs
  services: string[];      // Service IDs
  certifications?: string[];
  warranty?: string;
  seo: { title, description, keywords };
}
```

### Industry
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  services: string[];      // Service IDs
  products: string[];      // Product IDs
  useCases?: Array<{ title, description, image }>;
  stats?: { clientsServed, projectsCompleted };
  seo: { title, description, keywords };
}
```

## 🎨 Customizing Templates

### Add Custom Section to Detail Page
```tsx
<GenericDetailTemplate
  data={item}
  type="location"
  renderCustomSections={(data) => (
    <div>
      <h2>Custom Section</h2>
      <p>Your custom content here</p>
    </div>
  )}
/>
```

### Custom Card Rendering in Listing
```tsx
<GenericListingTemplate
  items={items}
  type="location"
  renderCard={(item) => (
    <div className="custom-card">
      {/* Your custom card design */}
    </div>
  )}
/>
```

## 🔍 Search & Filter

### Adding Filters to Listing
```tsx
filterOptions={[
  {
    id: 'filter1',
    label: 'Filter Label',
    filter: (item) => item.property === 'value'
  }
]}
```

## 📝 SEO Best Practices

Always include in data:
```typescript
seo: {
  title: 'Page Title | Location | WAINSO',
  description: '150-160 character description',
  keywords: ['keyword1', 'keyword2', 'keyword3']
}
```

## 🐛 Troubleshooting

### Page Not Found
- Check slug matches `generateSlug()` output
- Verify data entry exists in data file
- Check route is added to `App.tsx`

### Type Errors
- Ensure data matches TypeScript interface
- Check `src/types/content.ts` for required fields

### Images Not Loading
- Use `/images/` path for local images
- Add fallback with `onError` handler
- Check image exists in `public/images/`

## 📚 Full Documentation

- **Complete Guide**: `TEMPLATE_SYSTEM_DOCUMENTATION.md`
- **Implementation Summary**: `PAGE_TEMPLATE_SYSTEM_SUMMARY.md`
- **Type Definitions**: `src/types/content.ts`




