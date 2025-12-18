/**
 * Product Sales Report - Works with current JSON items structure
 * 
 * This script demonstrates how to generate product-wise reports
 * using MySQL JSON functions with the current structure.
 * 
 * Usage: node server/scripts/product-sales-report.js [start_date] [end_date]
 */

const { getPool } = require('../db');

async function generateProductSalesReport(startDate = null, endDate = null) {
  const pool = getPool();
  
  try {
    // Query to extract product_id from JSON items and aggregate sales
    // This works with the current JSON structure
    let query = `
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.product_id')) as product_id,
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.description')) as product_name,
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.hsn_code')) as hsn_code,
        SUM(JSON_EXTRACT(item.value, '$.quantity')) as total_quantity,
        AVG(JSON_EXTRACT(item.value, '$.price')) as avg_price,
        SUM(JSON_EXTRACT(item.value, '$.quantity') * JSON_EXTRACT(item.value, '$.price')) as total_revenue,
        COUNT(DISTINCT i.id) as invoice_count
      FROM invoices i
      CROSS JOIN JSON_TABLE(
        i.items,
        '$[*]' COLUMNS (
          product_id VARCHAR(255) PATH '$.product_id',
          description VARCHAR(255) PATH '$.description',
          hsn_code VARCHAR(50) PATH '$.hsn_code',
          quantity DECIMAL(10,2) PATH '$.quantity',
          price DECIMAL(10,2) PATH '$.price'
        )
      ) as item
      WHERE i.is_deleted = 0
        AND i.status != 'cancelled'
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND i.issue_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND i.issue_date <= ?';
      params.push(endDate);
    }
    
    query += `
      GROUP BY 
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.product_id')),
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.description')),
        JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.hsn_code'))
      HAVING product_id IS NOT NULL AND product_id != ''
      ORDER BY total_revenue DESC
    `;
    
    const [rows] = await pool.execute(query, params);
    
    console.log('\n=== Product Sales Report ===\n');
    console.log(`Period: ${startDate || 'All time'} to ${endDate || 'Today'}\n`);
    
    if (rows.length === 0) {
      console.log('No product sales found.');
      return;
    }
    
    let totalRevenue = 0;
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.product_name || 'Unknown Product'}`);
      console.log(`   Product ID: ${row.product_id}`);
      console.log(`   HSN Code: ${row.hsn_code || 'N/A'}`);
      console.log(`   Quantity Sold: ${parseFloat(row.total_quantity).toFixed(2)}`);
      console.log(`   Avg Price: ₹${parseFloat(row.avg_price).toFixed(2)}`);
      console.log(`   Total Revenue: ₹${parseFloat(row.total_revenue).toFixed(2)}`);
      console.log(`   Invoices: ${row.invoice_count}`);
      console.log('');
      totalRevenue += parseFloat(row.total_revenue);
    });
    
    console.log(`\nTotal Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Total Products: ${rows.length}`);
    
    return rows;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// Alternative simpler query for MySQL 5.7+ (if JSON_TABLE is not available)
async function generateProductSalesReportSimple(startDate = null, endDate = null) {
  const pool = getPool();
  
  try {
    // Get all invoices and process items in Node.js
    let query = `
      SELECT i.id, i.invoice_number, i.issue_date, i.items, i.status
      FROM invoices i
      WHERE i.is_deleted = 0
        AND i.status != 'cancelled'
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND i.issue_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND i.issue_date <= ?';
      params.push(endDate);
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Aggregate product sales in JavaScript
    const productSales = new Map();
    
    rows.forEach(invoice => {
      const items = typeof invoice.items === 'string' 
        ? JSON.parse(invoice.items) 
        : invoice.items;
      
      items.forEach(item => {
        if (item.product_id) {
          const key = item.product_id;
          if (!productSales.has(key)) {
            productSales.set(key, {
              product_id: item.product_id,
              product_name: item.description,
              hsn_code: item.hsn_code,
              total_quantity: 0,
              total_revenue: 0,
              invoice_count: new Set(),
              prices: []
            });
          }
          
          const sales = productSales.get(key);
          sales.total_quantity += parseFloat(item.quantity || 0);
          sales.total_revenue += parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
          sales.invoice_count.add(invoice.id);
          sales.prices.push(parseFloat(item.price || 0));
        }
      });
    });
    
    // Convert to array and calculate averages
    const report = Array.from(productSales.values()).map(sales => ({
      ...sales,
      invoice_count: sales.invoice_count.size,
      avg_price: sales.prices.reduce((a, b) => a + b, 0) / sales.prices.length
    })).sort((a, b) => b.total_revenue - a.total_revenue);
    
    console.log('\n=== Product Sales Report (Simple Method) ===\n');
    console.log(`Period: ${startDate || 'All time'} to ${endDate || 'Today'}\n`);
    
    if (report.length === 0) {
      console.log('No product sales found.');
      return;
    }
    
    let totalRevenue = 0;
    report.forEach((row, index) => {
      console.log(`${index + 1}. ${row.product_name || 'Unknown Product'}`);
      console.log(`   Product ID: ${row.product_id}`);
      console.log(`   HSN Code: ${row.hsn_code || 'N/A'}`);
      console.log(`   Quantity Sold: ${row.total_quantity.toFixed(2)}`);
      console.log(`   Avg Price: ₹${row.avg_price.toFixed(2)}`);
      console.log(`   Total Revenue: ₹${row.total_revenue.toFixed(2)}`);
      console.log(`   Invoices: ${row.invoice_count}`);
      console.log('');
      totalRevenue += row.total_revenue;
    });
    
    console.log(`\nTotal Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Total Products: ${report.length}`);
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const startDate = process.argv[2] || null;
  const endDate = process.argv[3] || null;
  
  // Try JSON_TABLE method first, fallback to simple method
  generateProductSalesReport(startDate, endDate)
    .catch(() => {
      console.log('\nFalling back to simple method...\n');
      return generateProductSalesReportSimple(startDate, endDate);
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to generate report:', error);
      process.exit(1);
    });
}

module.exports = { generateProductSalesReport, generateProductSalesReportSimple };
