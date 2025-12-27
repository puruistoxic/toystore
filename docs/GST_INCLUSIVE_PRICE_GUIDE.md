# GST-Inclusive Price Handling Guide

## Overview

This feature allows products to have prices that already include GST, eliminating the need to manually update each product. The system automatically handles both GST-exclusive and GST-inclusive prices in invoice/proposal calculations.

## How It Works

### Database Schema

A new field `price_includes_gst` (BOOLEAN, default: FALSE) has been added to the `products` table:
- `FALSE` (default): Price is GST-exclusive - GST will be added on top
- `TRUE`: Price already includes GST - GST will be extracted from the price

### Calculation Logic

**For GST-Exclusive Prices (price_includes_gst = FALSE):**
```
Subtotal = Sum(quantity × price)
Tax = Subtotal × (tax_rate / 100)
Total = Subtotal + Tax - Discount
```

**For GST-Inclusive Prices (price_includes_gst = TRUE):**
```
Item Total = quantity × price (this already includes GST)
Base Price = Item Total / (1 + tax_rate/100)
Tax = Item Total - Base Price
Subtotal = Sum(Base Price for all items)
Total Tax = Sum(Tax for all items)
Total = Subtotal + Total Tax - Discount
```

## Migration

### Automatic Migration (Recommended)

The database schema automatically adds the column when the application starts. All existing products default to `price_includes_gst = FALSE` (GST-exclusive), so no manual updates are needed.

### Manual Migration Script

If you want to set all existing products to GST-inclusive:

```bash
cd server
node scripts/add-price-includes-gst.js --default-true
```

Or to just add the column (default behavior):

```bash
cd server
node scripts/add-price-includes-gst.js
```

## Usage

### Setting GST-Inclusive Price for a Product

1. **In Product Form (Admin):**
   - Go to Admin → Products → Edit Product
   - Check the "Price includes GST" checkbox
   - Save the product

2. **In Quick Add Product Modal:**
   - When adding a product from invoice/proposal form
   - Check "Price includes GST" checkbox
   - The flag will be saved with the product

### How It Affects Invoices/Proposals

- When you select a product in an invoice/proposal, the system automatically:
  - Reads the `price_includes_gst` flag from the product
  - Stores it in the invoice/proposal item
  - Calculates totals correctly based on the flag

- You can mix GST-exclusive and GST-inclusive products in the same invoice
- Each item is calculated independently based on its own flag

## Examples

### Example 1: GST-Exclusive Product
- Product Price: ₹10,000
- `price_includes_gst`: FALSE
- Tax Rate: 18%
- Quantity: 1

**Calculation:**
- Subtotal: ₹10,000
- Tax: ₹10,000 × 18% = ₹1,800
- Total: ₹11,800

### Example 2: GST-Inclusive Product
- Product Price: ₹11,800
- `price_includes_gst`: TRUE
- Tax Rate: 18%
- Quantity: 1

**Calculation:**
- Item Total: ₹11,800 (includes GST)
- Base Price: ₹11,800 / 1.18 = ₹10,000
- Tax: ₹11,800 - ₹10,000 = ₹1,800
- Subtotal: ₹10,000
- Total Tax: ₹1,800
- Total: ₹11,800

### Example 3: Mixed Products in One Invoice
- Item 1: ₹10,000 (GST-exclusive) × 1 = ₹10,000
- Item 2: ₹11,800 (GST-inclusive) × 1 = ₹11,800
- Tax Rate: 18%
- Discount: ₹0

**Calculation:**
- Item 1 Base: ₹10,000, Tax: ₹1,800
- Item 2 Base: ₹10,000, Tax: ₹1,800
- Subtotal: ₹20,000
- Total Tax: ₹3,600
- Total: ₹23,600

## Backward Compatibility

- All existing products default to `price_includes_gst = FALSE`
- Existing invoices/proposals continue to work as before
- No data migration required for existing records
- The flag is optional in invoice/proposal items (defaults to FALSE if not present)

## Technical Details

### Files Modified

1. **Database:**
   - `server/db.js` - Added column to products table schema
   - `server/scripts/add-price-includes-gst.js` - Migration script

2. **Backend:**
   - `server/routes/content.js` - Product CRUD operations
   - `server/routes/invoicing.js` - Invoice/proposal calculations
   - `server/utils/calculateInvoiceTotals.js` - New calculation utility

3. **Frontend:**
   - `src/types/invoicing.ts` - Added `price_includes_gst` to item types
   - `src/components/admin/InvoiceForm.tsx` - Updated calculation logic
   - `src/components/admin/ProductForm.tsx` - Added checkbox UI
   - `src/components/admin/QuickAddProductModal.tsx` - Added checkbox UI

### API Changes

No breaking changes. The `price_includes_gst` field is optional in all API requests and defaults to `false` if not provided.

## Best Practices

1. **Set the flag when creating products** - It's easier to set it correctly from the start
2. **Review existing products** - If you know certain products have GST-inclusive prices, update them through the admin interface
3. **Use bulk update** - If most of your products are GST-inclusive, use the migration script with `--default-true` flag
4. **Verify calculations** - Always verify the first few invoices after enabling this feature

## Troubleshooting

**Q: My invoice totals seem wrong after enabling this feature**
A: Check if the `price_includes_gst` flag is set correctly for your products. The system calculates differently based on this flag.

**Q: Can I change the flag for existing products?**
A: Yes, edit the product in the admin interface and toggle the "Price includes GST" checkbox.

**Q: What if I have a mix of GST-exclusive and GST-inclusive products?**
A: That's perfectly fine! Each product can have its own setting, and the system handles them correctly in the same invoice.
