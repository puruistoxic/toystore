# Toy Segmentation Strategy for Make Toys

## Overview
This document outlines how toys can be segmented and filtered on the Make Toys wholesale platform to help retailers and distributors find the right products for their customers.

## Segmentation Dimensions

### 1. Age Groups
**Purpose:** Help retailers select age-appropriate toys for their target market.

**Categories:**
- **0-2 Years** (Infants) - Rattles, teethers, soft toys, sensory toys
- **3-5 Years** (Toddlers) - Building blocks, simple puzzles, ride-on toys, educational toys
- **6-8 Years** (Early Elementary) - Board games, action figures, remote control toys, craft kits
- **9-12 Years** (Pre-teens) - Complex puzzles, strategy games, STEM toys, collectibles
- **13+ Years** (Teens/Adults) - Advanced board games, model kits, hobby items

**Implementation:**
- Stored in `products.age_group` field as VARCHAR(100)
- Can store multiple ranges like "3-5, 6-8" for toys suitable for multiple ages
- Filterable on product listing pages
- Displayed prominently on product detail pages

### 2. Occasions
**Purpose:** Help retailers stock up for seasonal demand and special events.

**Categories:**
- **Birthday** - Party favors, gift sets, themed toys
- **Holidays** - Diwali, Christmas, New Year, festivals
- **Back to School** - Educational toys, stationery sets, learning aids
- **Summer/Winter** - Seasonal toys (outdoor toys, indoor games)
- **Festivals** - Regional festivals, cultural celebrations
- **Gift Sets** - Premium packaging, combo packs
- **Educational** - Learning-focused toys for schools and parents

**Implementation:**
- Stored in `products.occasion` field as JSON array
- Example: `["birthday", "holiday", "gift-set"]`
- Allows multiple occasions per product
- Filterable and searchable
- Can be used for seasonal promotions

### 3. Gender Targeting
**Purpose:** Help retailers understand target demographics (though many toys are unisex).

**Categories:**
- **Boys** - Action figures, vehicles, sports toys
- **Girls** - Dolls, fashion toys, arts & crafts
- **Unisex** - Educational toys, board games, puzzles, building blocks
- **All** - Suitable for everyone

**Implementation:**
- Stored in `products.gender` field as ENUM
- Default: 'unisex' or 'all'
- Filterable on product pages
- Displayed as badges on product cards

### 4. Material Type
**Purpose:** Important for safety compliance and customer preferences.

**Categories:**
- **Plastic** - Most common, durable, easy to clean
- **Wood** - Eco-friendly, traditional, premium feel
- **Fabric/Soft** - Plush toys, soft dolls, sensory toys
- **Metal** - Model kits, collectibles, premium items
- **Electronic** - Battery-operated, remote control, interactive
- **Mixed** - Combination of materials

**Implementation:**
- Stored in `products.material_type` field as VARCHAR(100)
- Filterable for safety-conscious retailers
- Important for compliance and certifications

### 5. Educational Value
**Purpose:** Help retailers target educational institutions and parents seeking learning toys.

**Categories:**
- **STEM** - Science, Technology, Engineering, Math
- **Language** - Reading, writing, vocabulary
- **Creativity** - Arts, crafts, imagination
- **Motor Skills** - Fine motor, gross motor development
- **Social Skills** - Board games, role-play, teamwork
- **None** - Pure entertainment toys

**Implementation:**
- Stored in `products.educational_value` field as BOOLEAN
- Additional details in `specifications` JSON field
- Can be expanded to JSON array for multiple values

### 6. Product Categories (Primary)
**Purpose:** Main product organization matching maketoys.in structure.

**Categories:**
- Action Figures
- Art & Crafts
- Baby Rattles
- Bath Toys
- Board Games
- Coin Bank
- Dolls & Doll Houses
- Drone
- Educational & Learning Toys
- Electric Ride Ons
- Manual Ride Ons
- Musical Toys
- Remote Control Toys
- Role Play Set
- And more...

**Implementation:**
- Stored in `products.category` field
- Hierarchical structure via `categories` table with `parent_id`
- Main navigation structure

## Filtering & Search Strategy

### Combined Filters
Users can combine multiple filters:
- Age Group + Category
- Occasion + Gender
- Material Type + Educational Value
- Price Range + Category

### Search Enhancement
- Search by age group keywords ("toddler toys", "preschool")
- Search by occasion ("birthday gifts", "Diwali toys")
- Search by material ("wooden toys", "plastic toys")

## Display Strategy

### Product Cards
Display key segments as badges:
- Age badge (e.g., "3-5 Years")
- Gender icon (if applicable)
- Occasion tags (if relevant)
- Educational badge (if educational)

### Product Detail Page
Show comprehensive segmentation:
- Age suitability prominently displayed
- Occasions listed
- Gender targeting (if specific)
- Material information
- Educational benefits highlighted

## Bulk Ordering Considerations

### Minimum Order Quantity
- Stored in `products.minimum_order_quantity`
- Different MOQs for different segments
- Educational toys may have higher MOQs for schools

### Bulk Discounts
- Stored in `products.bulk_discount_percentage`
- Tiered pricing based on quantity
- Occasion-based bulk orders (e.g., Diwali bulk orders)

## Marketing & Promotions

### Seasonal Campaigns
- Filter by occasion for seasonal promotions
- "Back to School" collections
- "Holiday Gift Guide"
- "Birthday Party Essentials"

### Age-Based Collections
- "Toddler Starter Pack"
- "Pre-School Learning Set"
- "Teen Hobby Collection"

### Educational Focus
- "STEM Toys Collection"
- "Learning & Development"
- "Creative Arts & Crafts"

## Data Entry Guidelines

### Age Group
- Use standard ranges: "0-2", "3-5", "6-8", "9-12", "13+"
- For multi-age: "3-5, 6-8"
- Always include if applicable

### Occasion
- Select all relevant occasions
- Don't over-tag (max 3-4 per product)
- Update seasonally

### Gender
- Default to "unisex" or "all" unless clearly targeted
- Avoid stereotypes where possible
- Focus on actual usage patterns

### Material
- Be specific
- Important for safety certifications
- Update if materials change

## Future Enhancements

1. **Price Segmentation** - Budget, mid-range, premium
2. **Brand Segmentation** - Popular brands, local brands
3. **Safety Certifications** - CE, ASTM, BIS compliance
4. **Packaging Types** - Individual, bulk, gift-wrapped
5. **Seasonality** - Year-round vs. seasonal availability
6. **Trending Tags** - Hot items, bestsellers, new arrivals

## API Considerations

When building filters, ensure:
- Fast queries with proper indexes
- JSON field queries for occasion arrays
- Enum queries for gender
- Range queries for age groups
- Combined filter support

## Database Indexes

Already implemented:
- `idx_age_group` on `products.age_group`
- `idx_gender` on `products.gender`
- `idx_occasion` on `products.occasion(255)` (JSON prefix index)

Consider adding:
- Composite indexes for common filter combinations
- Full-text search on occasion JSON for better search
