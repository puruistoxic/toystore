# Reporting Guide: Product Sales Analysis

This guide explains how to generate product-wise reports with the current JSON items structure and the future line items table structure.

## Current Structure (JSON Items)

The current structure stores items as JSON in the `items` column. This works well for most use cases and doesn't require any migration.

### Advantages
- ✅ No migration needed
- ✅ Backward compatible
- ✅ Simple to maintain
- ✅ Works with existing invoices

### Disadvantages
- ⚠️ JSON queries can be slower for large datasets
- ⚠️ More complex SQL for aggregations

### Example Queries

#### 1. Product Sales Report (MySQL 8.0+ with JSON_TABLE)

```sql
SELECT 
  JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.product_id')) as product_id,
  JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.description')) as product_name,
  SUM(JSON_EXTRACT(item.value, '$.quantity')) as total_quantity,
  SUM(JSON_EXTRACT(item.value, '$.quantity') * JSON_EXTRACT(item.value, '$.price')) as total_revenue,
  COUNT(DISTINCT i.id) as invoice_count
FROM invoices i
CROSS JOIN JSON_TABLE(
  i.items,
  '$[*]' COLUMNS (
    product_id VARCHAR(255) PATH '$.product_id',
    description VARCHAR(255) PATH '$.description',
    quantity DECIMAL(10,2) PATH '$.quantity',
    price DECIMAL(10,2) PATH '$.price'
  )
) as item
WHERE i.is_deleted = 0
  AND i.status != 'cancelled'
  AND JSON_EXTRACT(item.value, '$.product_id') IS NOT NULL
GROUP BY product_id, product_name
ORDER BY total_revenue DESC;
```

#### 2. Product Sales Report (MySQL 5.7 / Simple Method)

For older MySQL versions or simpler queries, process in application code:

```javascript
// See server/scripts/product-sales-report.js for full implementation
const invoices = await getInvoices();
const productSales = {};

invoices.forEach(invoice => {
  invoice.items.forEach(item => {
    if (item.product_id) {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product_id: item.product_id,
          product_name: item.description,
          total_quantity: 0,
          total_revenue: 0,
          invoice_count: new Set()
        };
      }
      productSales[item.product_id].total_quantity += item.quantity;
      productSales[item.product_id].total_revenue += item.quantity * item.price;
      productSales[item.product_id].invoice_count.add(invoice.id);
    }
  });
});
```

### Running the Report Script

```bash
# All time report
node server/scripts/product-sales-report.js

# Date range report
node server/scripts/product-sales-report.js 2024-01-01 2024-12-31
```

## Future Structure (Line Items Table)

If you migrate to a line items table structure, reporting becomes much simpler and faster.

### Advantages
- ✅ Fast queries with proper indexes
- ✅ Simple SQL aggregations
- ✅ Better for complex reporting
- ✅ Easier to join with products table

### Disadvantages
- ⚠️ Requires migration
- ⚠️ More tables to manage
- ⚠️ Need to update API routes

### Example Queries (After Migration)

```sql
-- Product Sales Report
SELECT 
  li.product_id,
  p.name as product_name,
  SUM(li.quantity) as total_quantity,
  AVG(li.price) as avg_price,
  SUM(li.total) as total_revenue,
  COUNT(DISTINCT li.invoice_id) as invoice_count
FROM invoice_line_items li
LEFT JOIN products p ON li.product_id = p.id
JOIN invoices i ON li.invoice_id = i.id
WHERE i.is_deleted = 0
  AND i.status != 'cancelled'
  AND li.product_id IS NOT NULL
GROUP BY li.product_id, p.name
ORDER BY total_revenue DESC;

-- Top Products by Revenue
SELECT 
  li.product_id,
  p.name as product_name,
  SUM(li.total) as revenue
FROM invoice_line_items li
LEFT JOIN products p ON li.product_id = p.id
JOIN invoices i ON li.invoice_id = i.id
WHERE i.issue_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND i.is_deleted = 0
GROUP BY li.product_id, p.name
ORDER BY revenue DESC
LIMIT 10;
```

### Migration

To migrate to line items table:

```bash
# Dry run (see what would happen)
node server/scripts/migrate-to-line-items.js --dry-run

# Actual migration (BACKUP FIRST!)
node server/scripts/migrate-to-line-items.js
```

## Recommendation

**For now, stick with JSON structure** because:
1. ✅ Your changes are backward compatible
2. ✅ No migration needed
3. ✅ Reporting works with the provided script
4. ✅ Can migrate later if needed

**Consider migrating to line items table if:**
- You have thousands of invoices
- You need very fast reporting queries
- You're building complex analytics dashboards
- You need to join with product master data frequently

## API Endpoint Example

You can create an API endpoint for product reports:

```javascript
// server/routes/invoicing.js
router.get('/reports/product-sales', authenticateToken, async (req, res) => {
  const { start_date, end_date } = req.query;
  const report = await generateProductSalesReport(start_date, end_date);
  res.json(report);
});
```
