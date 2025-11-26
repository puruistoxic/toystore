# Page Links and Navigation Guide

## 🔗 Where New Pages Are Linked Throughout the Website

### 1. **Header Navigation** ✅
**Location**: `src/components/Header.tsx`

The **About** dropdown menu includes:
- **Service Areas** → `/locations`
- **Our Brands** → `/brands`
- **Industries We Serve** → `/industries`
- **Case Studies** → `/case-studies`

### 2. **Footer Navigation** ✅
**Location**: `src/components/Footer.tsx`

Quick Links section includes:
- **Service Areas** → `/locations`
- **Our Brands** → `/brands`
- **Industries** → `/industries`
- **Case Studies** → `/case-studies`

### 3. **Home Page** ✅
**Location**: `src/pages/Home.tsx`

- **Service Areas Section**: Each city card links to its location detail page
  - Ramgarh → `/locations/ramgarh`
  - Ramgarh Cantt → `/locations/ramgarh-cantt`
  - Hazaribagh → `/locations/hazaribagh`
  - Ranchi → `/locations/ranchi`
  - Dhanbad → `/locations/dhanbad`
  - Bokaro → `/locations/bokaro`
  - Jamshedpur → `/locations/jamshedpur`
- **"View All Service Areas"** button → `/locations`

### 4. **Detail Pages - Related Items** ✅

All detail pages automatically show related items with links:

#### **Location Detail Pages** (`/locations/:slug`)
- Related Services → `/services/:slug`
- Related Products → `/products/:slug`
- Related Testimonials (displayed on page)
- Related Case Studies → `/case-studies/:slug`

#### **Brand Detail Pages** (`/brands/:slug`)
- Related Services → `/services/:slug`
- Related Products → `/products/:slug`

#### **Industry Detail Pages** (`/industries/:slug`)
- Related Services → `/services/:slug`
- Related Products → `/products/:slug`
- Related Testimonials (displayed on page)
- Related Case Studies → `/case-studies/:slug`

#### **Case Study Detail Pages** (`/case-studies/:slug`)
- Related Location → `/locations/:slug`
- Related Industry → `/industries/:slug`
- Related Services → `/services/:slug`
- Related Products → `/products/:slug`
- Related Brand → `/brands/:slug` (if applicable)

### 5. **Breadcrumb Navigation** ✅

All detail pages include breadcrumb navigation:
- Home → [Page Type] → [Item Name]
- Example: Home → Service Areas → Ramgarh

### 6. **Service Detail Pages** (Future Enhancement)
**Location**: `src/pages/ServiceDetail.tsx`

Can be enhanced to show:
- Related Locations → `/locations/:slug`
- Related Brands → `/brands/:slug`
- Related Industries → `/industries/:slug`

### 7. **Product Detail Pages** (Future Enhancement)
**Location**: `src/pages/ProductDetail.tsx`

Can be enhanced to show:
- Related Brand → `/brands/:slug`
- Related Locations → `/locations/:slug`
- Related Industries → `/industries/:slug`

## 📍 Available Routes

### Listing Pages
- `/locations` - All service areas
- `/brands` - All brands/partners
- `/industries` - All industries served
- `/case-studies` - All case studies

### Detail Pages
- `/locations/:slug` - Individual location pages
- `/brands/:slug` - Individual brand pages
- `/industries/:slug` - Individual industry pages
- `/case-studies/:slug` - Individual case study pages

## 🔍 How to Add More Links

### Adding Links to Service Detail Pages

Edit `src/pages/ServiceDetail.tsx`:
```tsx
// Add related locations
const relatedLocations = locations.filter(loc => 
  loc.services.includes(service.id)
);

// Add related brands
const relatedBrands = brands.filter(brand => 
  brand.services.includes(service.id)
);
```

### Adding Links to Product Detail Pages

Edit `src/pages/ProductDetail.tsx`:
```tsx
// Add related brand
const relatedBrand = brands.find(brand => 
  brand.products.includes(product.id)
);

// Add related locations
const relatedLocations = locations.filter(loc => 
  loc.products.includes(product.id)
);
```

### Adding Links to About Page

Edit `src/pages/About.tsx` to add sections linking to:
- Service Areas → `/locations`
- Our Brands → `/brands`
- Industries → `/industries`
- Case Studies → `/case-studies`

## 🎯 SEO Benefits

All these interconnections create:
1. **Internal Linking**: Improves SEO by linking related content
2. **User Navigation**: Easy discovery of related content
3. **Content Relationships**: Shows connections between services, products, locations, brands, and industries
4. **Breadcrumbs**: Help search engines understand site structure

## 📊 Link Structure Summary

```
Home Page
├── Service Areas Section → /locations
│   └── Individual Cities → /locations/:slug
│
Header Navigation
└── About Dropdown
    ├── Service Areas → /locations
    ├── Our Brands → /brands
    ├── Industries We Serve → /industries
    └── Case Studies → /case-studies

Footer
└── Quick Links
    ├── Service Areas → /locations
    ├── Our Brands → /brands
    ├── Industries → /industries
    └── Case Studies → /case-studies

Detail Pages (Automatic)
├── Location Detail
│   ├── Related Services → /services/:slug
│   ├── Related Products → /products/:slug
│   └── Related Case Studies → /case-studies/:slug
│
├── Brand Detail
│   ├── Related Services → /services/:slug
│   └── Related Products → /products/:slug
│
├── Industry Detail
│   ├── Related Services → /services/:slug
│   ├── Related Products → /products/:slug
│   └── Related Case Studies → /case-studies/:slug
│
└── Case Study Detail
    ├── Related Location → /locations/:slug
    ├── Related Industry → /industries/:slug
    ├── Related Services → /services/:slug
    └── Related Products → /products/:slug
```

All pages are now interconnected and easily discoverable! 🎉

