/**
 * Calculate invoice/proposal totals with support for GST-inclusive prices
 * 
 * @param {Array} items - Array of items with price, quantity, and optional price_includes_gst
 * @param {number} taxRate - Tax rate percentage (e.g., 18 for 18%)
 * @param {number} discount - Discount amount
 * @param {string} invoiceType - 'confirmed' (with GST) or 'sharing' (no GST)
 * @returns {Object} - { subtotal, taxAmount, total }
 */
function calculateInvoiceTotals(items, taxRate, discount = 0, invoiceType = 'confirmed') {
  let subtotal = 0;
  let totalTaxAmount = 0;

  items.forEach((item) => {
    const itemPrice = parseFloat(item.price || 0);
    const quantity = parseFloat(item.quantity || 0);
    const itemTotal = itemPrice * quantity;
    const priceIncludesGst = item.price_includes_gst === true;

    if (invoiceType === 'confirmed' && priceIncludesGst) {
      // Price already includes GST - extract base price and tax
      // Formula: base_price = price / (1 + tax_rate/100)
      // tax = price - base_price
      const basePrice = itemTotal / (1 + taxRate / 100);
      const itemTax = itemTotal - basePrice;
      subtotal += basePrice;
      totalTaxAmount += itemTax;
    } else if (invoiceType === 'confirmed') {
      // Price excludes GST - add tax on top
      subtotal += itemTotal;
      totalTaxAmount += (itemTotal * taxRate) / 100;
    } else {
      // Sharing invoice - no tax calculation
      subtotal += itemTotal;
    }
  });

  const total = subtotal + totalTaxAmount - parseFloat(discount || 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    taxAmount: Math.round(totalTaxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

module.exports = {
  calculateInvoiceTotals
};


