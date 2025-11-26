# Template-Based Page System Documentation

## Overview

This application uses a **template-based, data-driven architecture** to serve all dynamic pages. Instead of creating individual page components for each item, we use reusable templates that are populated with data from centralized data files.

## Architecture Benefits

1. **No Code Duplication**: Single template serves multiple pages
2. **Easy Content Management**: Update data files to update pages
3. **Consistent UI/UX**: All pages follow the same design patterns
4. **SEO Optimized**: Built-in SEO support for all pages
5. **Fast Loading**: Data files are lightweight and load quickly
6. **Scalable**: Easy to add new pages by adding data entries

## Page Types Supported

### 1. **Services** ✅
- Listing: `/services`
- Detail: `/services/:slug`
- Data: `src/data/services.ts`

### 2. **Products** ✅
- Listing: `/products`
- Detail: `/products/:slug`
- Data: `src/data/products.ts`

### 3. **Locations** ✅ NEW
- Listing: `/locations`
- Detail: `/locations/:slug`
- Data: `src/data/locations.ts`
- Examples: Ramgarh, Ranchi, Dhanbad, etc.

### 4. **Brands** ✅ NEW
- Listing: `/brands`
- Detail: `/brands/:slug`
- Data: `src/data/brands.ts`
- Examples: CP Plus, Hikvision, Godrej, etc.

### 5. **Industries** ✅ NEW
- Listing: `/industries`
- Detail: `/industries/:slug`
- Data: `src/data/industries.ts`
- Examples: Retail, Manufacturing, Healthcare, etc.

### 6. **Case Studies** ✅ NEW
- Detail: `/case-studies/:slug`
- Data: `src/data/caseStudies.ts`

### 7. **Testimonials** ✅ NEW
- Data: `src/data/testimonials.ts`
- Displayed on related pages

## Template Components

### GenericDetailTemplate
**Location**: `src/components/templates/GenericDetailTemplate.tsx`

A reusable template for detail pages (locations, brands, industries, etc.).

**Features**:
- SEO optimization
- Breadcrumb navigation
- Hero section with image
- Related items (services, products, testimonials, case studies)
- Custom sections support
- CTA section

**Usage**:
```tsx
<GenericDetailTemplate
  data={location}
  type="location"
  relatedItems={{
    services: [...],
    products: [...],
    testimonials: [...]
  }}
  breadcrumbs={[...]}
  renderCustomSections={(data) => <CustomContent />}
/>
```

### GenericListingTemplate
**Location**: `src/components/templates/GenericListingTemplate.tsx`

A reusable template for listing pages with search and filtering.

**Features**:
- Search functionality
- Filter options
- Responsive grid layout
- Custom card rendering
- SEO optimization

**Usage**:
```tsx
<GenericListingTemplate
  items={locations}
  type="location"
  title="Our Service Areas"
  description="..."
  searchPlaceholder="Search locations..."
  filterOptions={[...]}
  getItemPath={(item) => `/locations/${item.slug}`}
/>
```

## Data Structure

All data follows TypeScript interfaces defined in `src/types/content.ts`:

- `Location`: Service areas and cities
- `Brand`: Authorized dealers and partners
- `Industry`: Industries served
- `Category`: Service/product categories
- `CaseStudy`: Project case studies
- `Testimonial`: Customer reviews
- `BlogPost`: Blog articles (future)
- `FAQ`: Frequently asked questions (future)

## Adding New Pages

### Step 1: Add Data Entry
Add a new entry to the appropriate data file (e.g., `src/data/locations.ts`):

```typescript
{
  id: '8',
  name: 'New City',
  slug: generateSlug('New City'),
  // ... other fields
}
```

### Step 2: Page is Automatically Available
The page is immediately available at `/locations/new-city` (or appropriate route).

### Step 3: (Optional) Customize Display
If you need custom sections, use `renderCustomSections` prop in the detail template.

## SEO Optimization

All pages include:
- Dynamic meta titles
- Meta descriptions
- Keywords
- Canonical URLs
- Structured data (via SEO component)

## Performance Considerations

1. **Data Files**: Lightweight JSON-like structures, loaded at build time
2. **No Database Queries**: All data is static, ensuring fast page loads
3. **Code Splitting**: React Router handles code splitting automatically
4. **Image Optimization**: Images are optimized during build process

## Future Enhancements

### Database Integration
If you need dynamic content management, you can:
1. Keep the template system
2. Replace data files with API calls
3. Add caching layer (React Query already included)
4. Use static generation for better performance

### Content Management System (CMS)
Consider integrating:
- **Headless CMS** (Strapi, Contentful, Sanity)
- **Static Site Generator** (Next.js with ISR)
- **Hybrid Approach**: Static for most, dynamic for frequently updated content

## Best Practices

1. **Keep Data Files Organized**: One file per content type
2. **Use TypeScript**: Type safety for all data structures
3. **SEO First**: Always include SEO metadata
4. **Consistent Naming**: Use `generateSlug()` for all slugs
5. **Related Items**: Link related content for better UX and SEO
6. **Images**: Use optimized images with fallbacks

## File Structure

```
src/
├── components/
│   └── templates/
│       ├── GenericDetailTemplate.tsx
│       └── GenericListingTemplate.tsx
├── data/
│   ├── services.ts
│   ├── products.ts
│   ├── locations.ts
│   ├── brands.ts
│   ├── industries.ts
│   ├── caseStudies.ts
│   ├── testimonials.ts
│   └── (future: blog.ts, faq.ts)
├── pages/
│   ├── LocationDetail.tsx
│   ├── Locations.tsx
│   ├── BrandDetail.tsx
│   ├── Brands.tsx
│   ├── IndustryDetail.tsx
│   ├── Industries.tsx
│   └── CaseStudyDetail.tsx
└── types/
    └── content.ts
```

## Example: Adding a New Location

1. **Add to `src/data/locations.ts`**:
```typescript
{
  id: '8',
  name: 'Giridih',
  slug: generateSlug('Giridih'),
  state: 'Jharkhand',
  country: 'India',
  description: '...',
  services: ['1', '2', '3'],
  products: ['1', '2', '3'],
  seo: {
    title: 'CCTV Installation in Giridih | WAINSO',
    description: '...',
    keywords: [...]
  }
}
```

2. **Page is automatically available** at `/locations/giridih`

3. **No code changes needed!** The template handles everything.

## Maintenance

- **Update Content**: Edit data files
- **Change Design**: Update template components
- **Add Features**: Extend templates with new props
- **SEO Updates**: Modify SEO component or data structure

This architecture ensures your website is maintainable, scalable, and follows industry best practices! 🚀

