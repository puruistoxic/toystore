import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Proposal } from '../types/invoicing';

interface CompanySettings {
  company_name?: string;
  logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  footer_text?: string;
  terms_and_conditions?: string;
}

interface InvoiceItemWithHSN {
  description: string;
  quantity: number;
  price: number;
  total?: number;
  hsn_code?: string;
}

// Helper function to convert number to words (Indian numbering system)
function numberToWords(num: number): string {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  
  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result.trim();
  }
  
  if (num === 0) return 'ZERO';
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  
  // Handle crores
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    result += convertHundreds(crores) + ' CRORE ';
  }
  
  // Handle lakhs
  if (integerPart >= 100000) {
    const lakhs = Math.floor((integerPart % 10000000) / 100000);
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + ' LAKH ';
    }
  }
  
  // Handle thousands
  if (integerPart >= 1000) {
    const thousands = Math.floor((integerPart % 100000) / 1000);
    if (thousands > 0) {
      result += convertHundreds(thousands) + ' THOUSAND ';
    }
  }
  
  // Handle hundreds, tens, ones
  const remainder = integerPart % 1000;
  if (remainder > 0) {
    result += convertHundreds(remainder) + ' ';
  }
  
  // Handle paise
  if (decimalPart > 0) {
    result += 'AND ' + convertHundreds(decimalPart) + ' PAISE ';
  }
  
  return result.trim() + ' ONLY';
}

// Helper function to format numbers for PDF (avoiding currency symbol encoding issues)
function formatNumberForPDF(value: number, currency: string = 'INR'): string {
  const formatted = value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `Rs. ${formatted}`;
}

// Helper function to format number without currency symbol (for tables)
function formatNumberOnly(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Format date as DD/MM/YYYY
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to draw invoice header (everything above the table)
function drawInvoiceHeader(
  doc: jsPDF,
  invoice: Invoice,
  companySettings: CompanySettings,
  pageWidth: number,
  margin: number,
  fontSize: number,
  fontSizeTitle: number,
  fontSizeHeading: number,
  isSharingInvoice: boolean
): number {
  let yPos = margin + 5;

  // INVOICE Title - Centered at top
  doc.setFontSize(fontSizeTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 103, 103); // #006767
  doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  
  yPos = margin + 15;
  const leftX = margin;
  
  // Left side - TO (Client Information)
  let toYPos = yPos;
  doc.setFontSize(fontSizeHeading);
  doc.setFont('helvetica', 'bold');
  doc.text('TO', leftX, toYPos);
  
  toYPos += 4;
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  // Show client name first
  if (invoice.client_name) {
    doc.text(invoice.client_name.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  // Show company name below client name if it exists and is different
  if (invoice.client_company && invoice.client_company !== invoice.client_name) {
    doc.text(invoice.client_company.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  
  doc.setFont('helvetica', 'normal');
  
  if (invoice.client_address) {
    const addressLines = invoice.client_address.split('\n').filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line.toUpperCase(), leftX, toYPos);
      toYPos += 4;
    });
  }
  
  const clientCityStateCountryZip = [
    invoice.client_city,
    invoice.client_state,
    invoice.client_country,
    invoice.client_postal_code
  ].filter((item): item is string => Boolean(item)).join(', ');
  if (clientCityStateCountryZip) {
    doc.text(clientCityStateCountryZip.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  
  // Client contact information
  if (invoice.client_phone) {
    doc.text(`Contact: ${invoice.client_phone}`, leftX, toYPos);
    toYPos += 4;
  }
  if (invoice.client_email) {
    doc.text(`Email: ${invoice.client_email}`, leftX, toYPos);
    toYPos += 4;
  }
  if (invoice.client_tax_id && !isSharingInvoice) {
    doc.text(`GSTIN: ${invoice.client_tax_id}`, leftX, toYPos);
    toYPos += 4;
  }

  // Right side - FROM (Company Information) with Date and Invoice Number at top
  let fromYPos = yPos;
  const rightTopX = pageWidth - margin;
  
  // Date and Invoice Number - Top Right
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE:${formatDate(invoice.issue_date)}`, rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.text(`INVOICE NO:${invoice.invoice_number}`, rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 6;
  
  // FROM label - Right aligned and bold
  doc.setFontSize(fontSizeHeading);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.setFontSize(fontSize);
  const companyName = companySettings.company_name || 'Company Name';
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.setFont('helvetica', 'normal');
  
  // Company Address - Right aligned
  if (companySettings.address_line1) {
    doc.text(companySettings.address_line1, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.address_line2) {
    doc.text(companySettings.address_line2, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.address_line3) {
    doc.text(companySettings.address_line3, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  const cityStateCountryZip = [
    companySettings.city,
    companySettings.state,
    companySettings.country,
    companySettings.postal_code
  ].filter((item): item is string => Boolean(item)).join(', ');
  if (cityStateCountryZip) {
    doc.text(cityStateCountryZip, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  
  // Contact Info - Right aligned
  if (companySettings.gstin && !isSharingInvoice) {
    doc.text(`GSTIN:${companySettings.gstin}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.phone) {
    doc.text(`Contact:${companySettings.phone}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.email) {
    doc.text(`Mail ID:${companySettings.email}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  
  // Return the maximum Y position (where table should start)
  return Math.max(toYPos, fromYPos) + 8;
}

export async function generateInvoicePDF(invoice: Invoice, companySettings: CompanySettings) {
  // Debug logging for client data
  console.log('=== Invoice PDF Generation Debug ===');
  console.log('Invoice ID:', invoice.id);
  console.log('Invoice Number:', invoice.invoice_number);
  console.log('Client ID:', invoice.client_id);
  console.log('Client Name:', invoice.client_name);
  console.log('Client Company:', invoice.client_company);
  console.log('Client Address:', invoice.client_address);
  console.log('Client City:', invoice.client_city);
  console.log('Client State:', invoice.client_state);
  console.log('Client Postal Code:', invoice.client_postal_code);
  console.log('Client Country:', invoice.client_country);
  console.log('Client Phone:', invoice.client_phone);
  console.log('Client Email:', invoice.client_email);
  console.log('Client Tax ID:', invoice.client_tax_id);
  console.log('Full Invoice Object Keys:', Object.keys(invoice));
  console.log('===================================');

  // Create A4 document with equal margins
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Equal margins on all sides (10mm)
  const margin = 10;
  
  // Check if this is a "sharing" invoice (no GST)
  const isSharingInvoice = (invoice as any).invoice_type === 'sharing';
  
  // Standardize font size (standard invoice font sizes)
  const fontSize = 9;        // Body text
  const fontSizeSmall = 8;   // Footer/small text
  const fontSizeTitle = 12;  // Main title (reduced from 16)
  const fontSizeHeading = 10; // Section headings
  
  // Calculate available width for table (page width minus margins)
  const tableWidth = pageWidth - (margin * 2);
  
  // Draw header on first page
  const itemsStartY = drawInvoiceHeader(
    doc,
    invoice,
    companySettings,
    pageWidth,
    margin,
    fontSize,
    fontSizeTitle,
    fontSizeHeading,
    isSharingInvoice
  );

  const items = invoice.items as InvoiceItemWithHSN[];
  
  // Helper function to add footer and page number
  const addPageNumber = (pageNum: number, total: number) => {
    // Footer text above page number
    const footerText = '© 2025 WAINSO GPS & Security System. All rights reserved. | Est. 2017 | 8+ Years in Business';
    doc.setFontSize(fontSizeSmall);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Page number below footer text
    doc.text(`Page ${pageNum} of ${total}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  };
  
  // Calculate available space for items table (leave space for totals and footer on last page)
  const spaceForTotals = 80; // Approximate space needed for totals, bank details, etc.
  const availableHeight = pageHeight - itemsStartY - spaceForTotals - margin;
  const rowHeight = 6; // Approximate height per row
  const headerHeight = 8; // Height for table header
  const maxRowsPerPage = Math.floor((availableHeight - headerHeight) / rowHeight);
  const itemsPerPage = Math.max(8, Math.min(maxRowsPerPage, 15)); // At least 8, max 15 items per page
  
  // Split items into pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;
  let itemIndex = 0;
  let lastTableFinalY = itemsStartY;

  // Process items in chunks
  while (itemIndex < items.length) {
    // If not first page, add new page and repeat full header
    if (currentPage > 1) {
      doc.addPage();
      
      // Repeat complete header on new page
      lastTableFinalY = drawInvoiceHeader(
        doc,
        invoice,
        companySettings,
        pageWidth,
        margin,
        fontSize,
        fontSizeTitle,
        fontSizeHeading,
        isSharingInvoice
      );
    }

    // Get items for current page
    const pageItems = items.slice(itemIndex, itemIndex + itemsPerPage);
    const tableData = pageItems.map((item, idx) => [
      (itemIndex + idx + 1).toString(),
      item.hsn_code || '',
      item.description || '',
      formatNumberOnly(item.price),
      formatNumberOnly(item.quantity),
      formatNumberOnly(item.quantity * item.price)
    ]);

    // Determine if this is the last page
    const isLastPage = currentPage === totalPages;

    autoTable(doc, {
      startY: lastTableFinalY,
      head: [['S.NO', 'HSN CODE', 'DESCRIPTION', 'Price', 'Qty', 'AMOUNT']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 103, 103], // #006767
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: fontSize
      },
      styles: { 
        fontSize: fontSize,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.06, halign: 'center' },
        1: { cellWidth: tableWidth * 0.12, halign: 'left' },
        2: { cellWidth: tableWidth * 0.40, halign: 'left' },
        3: { cellWidth: tableWidth * 0.14, halign: 'right' },
        4: { cellWidth: tableWidth * 0.10, halign: 'right' },
        5: { cellWidth: tableWidth * 0.18, halign: 'right' }
      },
      didParseCell: (data: any) => {
        // Right-align headers for Price, Qty, and AMOUNT columns
        if (data.section === 'head') {
          if (data.column.index === 3 || data.column.index === 4 || data.column.index === 5) {
            data.cell.styles.halign = 'right';
          }
        }
      },
      margin: { left: margin, right: margin }
    });

    lastTableFinalY = (doc as any).lastAutoTable.finalY + 10;
    itemIndex += itemsPerPage;
    
    // Add page number on intermediate pages
    if (!isLastPage) {
      addPageNumber(currentPage, totalPages);
    }
    
    currentPage++;
  }

  const itemsTableFinalY = lastTableFinalY;
  
  // Totals Section - Start below items table, styled like table items
  const totalsTableData: string[][] = [];
  
  // Subtotal (first row)
  totalsTableData.push(['SUBTOTAL', formatNumberOnly(invoice.subtotal)]);
  
  // GST (only if not sharing invoice)
  if (!isSharingInvoice && invoice.tax_amount > 0) {
    totalsTableData.push([`GST ${invoice.tax_rate}%`, formatNumberOnly(invoice.tax_amount)]);
  }
  
  // Discount
  if (invoice.discount > 0) {
    totalsTableData.push(['DISCOUNT', formatNumberOnly(invoice.discount)]);
  }
  
  // Final TOTAL
  totalsTableData.push(['TOTAL', formatNumberOnly(invoice.total)]);
  
  // Calculate totals table width (same as items table)
  const totalsTableWidth = tableWidth * 0.28; // Label + Value columns
  const totalsTableStartX = pageWidth - margin - totalsTableWidth;
  
  autoTable(doc, {
    startY: itemsTableFinalY,
    head: [['', '']],
    body: totalsTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: 255, 
      fontStyle: 'bold',
      fontSize: fontSize,
      lineWidth: 0
    },
    bodyStyles: {
      fontSize: fontSize,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: totalsTableWidth * 0.5, halign: 'left', fontStyle: 'normal' },
      1: { cellWidth: totalsTableWidth * 0.5, halign: 'right', fontStyle: 'normal' }
    },
    margin: { left: totalsTableStartX, right: margin },
    showHead: 'never',
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    }
  });
  
  const totalsFinalY = (doc as any).lastAutoTable.finalY;
  let totalsY = totalsFinalY;
  
  // Define positions for payment status (aligned with totals table)
  const totalsX = totalsTableStartX;
  const totalsValueX = pageWidth - margin;

  // Amount in Words - Improved styling
  totalsY += 10;
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 103, 103); // #006767
  doc.text('Amount in Words:', margin, totalsY);
  totalsY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const amountInWords = numberToWords(invoice.total);
  const wordsLines = doc.splitTextToSize(amountInWords, pageWidth - (margin * 2));
  doc.text(wordsLines, margin, totalsY);
  totalsY += wordsLines.length * 4 + 10;

  // Payment Status
  if (invoice.paid_amount && invoice.paid_amount > 0) {
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Paid Amount:`, totalsX, totalsY);
    doc.text(formatNumberForPDF(invoice.paid_amount, invoice.currency), totalsValueX, totalsY, { align: 'right' });
    
    totalsY += 5;
    const balance = invoice.total - invoice.paid_amount;
    doc.setFont('helvetica', 'bold');
    doc.text(`Balance Due:`, totalsX, totalsY);
    doc.text(formatNumberForPDF(balance, invoice.currency), totalsValueX, totalsY, { align: 'right' });
    totalsY += 8;
  }

  // Bank Account Details - Bottom Left
  if (companySettings.bank_name || companySettings.bank_account_number) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Details', margin, totalsY);
    totalsY += 4;
    doc.setFont('helvetica', 'normal');
    
    if (companySettings.bank_account_name || companySettings.company_name) {
      doc.text(`Name: ${companySettings.bank_account_name || companySettings.company_name}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_account_number) {
      doc.text(`Acc/no: ${companySettings.bank_account_number}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_ifsc) {
      doc.text(`IFSC: ${companySettings.bank_ifsc}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_name) {
      doc.text(`BANK: ${companySettings.bank_name}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_branch) {
      const branchLine = `BRANCH: ${companySettings.bank_branch}`;
      if (companySettings.postal_code) {
        doc.text(`${branchLine}, ${companySettings.postal_code}`, margin, totalsY);
      } else {
        doc.text(branchLine, margin, totalsY);
      }
      totalsY += 4;
    }
  }

  // Authorized Signature - Bottom Right (only if there's space)
  const signatureY = totalsY + 15;
  if (signatureY < pageHeight - 20) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.text('Authorized Signature', pageWidth - margin, signatureY, { align: 'right' });
  }

  // Terms and Notes (only if there's enough space, otherwise skip to avoid unnecessary page break)
  let termsY = signatureY + 10;
  if (termsY > pageHeight - 30) {
    // Not enough space, skip terms/notes to avoid unnecessary page break
    termsY = pageHeight;
  }
  
  if (invoice.terms) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin, totalsY);
    totalsY += 4;
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - (margin * 2));
    doc.text(termsLines, margin, totalsY);
    totalsY += termsLines.length * 4.5;
  }

  if (invoice.notes) {
    totalsY += 5;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, totalsY);
    totalsY += 4;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
    doc.text(notesLines, margin, totalsY);
    totalsY += notesLines.length * 4;
  }

  // Footer - Only on last page (if different from standard footer)
  if (companySettings.footer_text && companySettings.footer_text !== '© 2025 WAINSO GPS & Security System. All rights reserved. | Est. 2017 | 8+ Years in Business') {
    const footerY = pageHeight - 12;
    doc.setFontSize(fontSizeSmall);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(companySettings.footer_text, pageWidth / 2, footerY, { align: 'center' });
  }

  // Add footer text and page number on last page
  addPageNumber(totalPages, totalPages);

  return doc;
}

// Helper function to draw proposal header (everything above the table)
function drawProposalHeader(
  doc: jsPDF,
  proposal: Proposal,
  companySettings: CompanySettings,
  pageWidth: number,
  margin: number,
  fontSize: number,
  fontSizeTitle: number,
  fontSizeHeading: number
): number {
  let yPos = margin + 5;

  // PROPOSAL Title - Centered at top
  doc.setFontSize(fontSizeTitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 103, 103); // #006767
  doc.text('PROPOSAL', pageWidth / 2, yPos, { align: 'center' });
  
  yPos = margin + 15;
  const leftX = margin;
  
  // Left side - TO (Client Information)
  let toYPos = yPos;
  doc.setFontSize(fontSizeHeading);
  doc.setFont('helvetica', 'bold');
  doc.text('TO', leftX, toYPos);
  
  toYPos += 4;
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  // Show client name first
  if (proposal.client_name) {
    doc.text(proposal.client_name.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  // Show company name below client name if it exists and is different
  if (proposal.client_company && proposal.client_company !== proposal.client_name) {
    doc.text(proposal.client_company.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  
  doc.setFont('helvetica', 'normal');
  
  if (proposal.client_address) {
    const addressLines = proposal.client_address.split('\n').filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line.toUpperCase(), leftX, toYPos);
      toYPos += 4;
    });
  }
  
  const clientCityStateCountryZip = [
    proposal.client_city,
    proposal.client_state,
    proposal.client_country,
    proposal.client_postal_code
  ].filter((item): item is string => Boolean(item)).join(', ');
  if (clientCityStateCountryZip) {
    doc.text(clientCityStateCountryZip.toUpperCase(), leftX, toYPos);
    toYPos += 4;
  }
  
  // Client contact information
  if (proposal.client_phone) {
    doc.text(`Contact: ${proposal.client_phone}`, leftX, toYPos);
    toYPos += 4;
  }
  if (proposal.client_email) {
    doc.text(`Email: ${proposal.client_email}`, leftX, toYPos);
    toYPos += 4;
  }
  if (proposal.client_tax_id) {
    doc.text(`GSTIN: ${proposal.client_tax_id}`, leftX, toYPos);
    toYPos += 4;
  }

  // Right side - FROM (Company Information) with Date and Proposal Number at top
  let fromYPos = yPos;
  const rightTopX = pageWidth - margin;
  
  // Date and Proposal Number - Top Right
  doc.setFont('helvetica', 'normal');
  const proposalDate = proposal.created_at ? formatDate(proposal.created_at) : formatDate(new Date().toISOString());
  doc.text(`DATE:${proposalDate}`, rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.text(`PROPOSAL NO:${proposal.proposal_number}`, rightTopX, fromYPos, { align: 'right' });
  
  if (proposal.valid_until) {
    fromYPos += 4;
    doc.text(`VALID UNTIL:${formatDate(proposal.valid_until)}`, rightTopX, fromYPos, { align: 'right' });
  }
  
  fromYPos += 6;
  
  // FROM label - Right aligned and bold
  doc.setFontSize(fontSizeHeading);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.setFontSize(fontSize);
  const companyName = companySettings.company_name || 'Company Name';
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), rightTopX, fromYPos, { align: 'right' });
  
  fromYPos += 4;
  doc.setFont('helvetica', 'normal');
  
  // Company Address - Right aligned
  if (companySettings.address_line1) {
    doc.text(companySettings.address_line1, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.address_line2) {
    doc.text(companySettings.address_line2, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.address_line3) {
    doc.text(companySettings.address_line3, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  const cityStateCountryZip = [
    companySettings.city,
    companySettings.state,
    companySettings.country,
    companySettings.postal_code
  ].filter((item): item is string => Boolean(item)).join(', ');
  if (cityStateCountryZip) {
    doc.text(cityStateCountryZip, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  
  // Contact Info - Right aligned
  if (companySettings.gstin) {
    doc.text(`GSTIN:${companySettings.gstin}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.phone) {
    doc.text(`Contact:${companySettings.phone}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  if (companySettings.email) {
    doc.text(`Mail ID:${companySettings.email}`, rightTopX, fromYPos, { align: 'right' });
    fromYPos += 4;
  }
  
  // Calculate where table should start (after title and description if they exist)
  let tableStartY = Math.max(toYPos, fromYPos) + 8;
  
  // Title (if exists)
  if (proposal.title) {
    doc.setFontSize(fontSizeHeading);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 103, 103); // #006767
    doc.text(proposal.title, leftX, tableStartY);
    tableStartY += 5;
    doc.setTextColor(0, 0, 0);
  }

  // Description (if exists)
  if (proposal.description) {
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(proposal.description, pageWidth - (margin * 2));
    doc.text(descLines, leftX, tableStartY);
    tableStartY += descLines.length * 4.5 + 5;
  }
  
  return tableStartY;
}

export async function generateProposalPDF(proposal: Proposal, companySettings: CompanySettings) {
  // Debug logging for client data
  console.log('=== Proposal PDF Generation Debug ===');
  console.log('Proposal ID:', proposal.id);
  console.log('Proposal Number:', proposal.proposal_number);
  console.log('Client ID:', proposal.client_id);
  console.log('Client Name:', proposal.client_name);
  console.log('Client Company:', proposal.client_company);
  console.log('Client Address:', proposal.client_address);
  console.log('Client City:', proposal.client_city);
  console.log('Client State:', proposal.client_state);
  console.log('Client Postal Code:', proposal.client_postal_code);
  console.log('Client Country:', proposal.client_country);
  console.log('Client Phone:', proposal.client_phone);
  console.log('Client Email:', proposal.client_email);
  console.log('Client Tax ID:', proposal.client_tax_id);
  console.log('Full Proposal Object Keys:', Object.keys(proposal));
  console.log('====================================');

  // Create A4 document with equal margins
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Equal margins on all sides (10mm)
  const margin = 10;
  
  // Standardize font size (standard invoice font sizes)
  const fontSize = 9;        // Body text
  const fontSizeSmall = 8;   // Footer/small text
  const fontSizeTitle = 12;  // Main title (reduced from 16)
  const fontSizeHeading = 10; // Section headings
  
  // Calculate available width for table (page width minus margins)
  const tableWidth = pageWidth - (margin * 2);
  
  // Draw header on first page
  const titleY = drawProposalHeader(
    doc,
    proposal,
    companySettings,
    pageWidth,
    margin,
    fontSize,
    fontSizeTitle,
    fontSizeHeading
  );

  // Items Table with proper number formatting and HSN code
  const items = proposal.items as InvoiceItemWithHSN[];
  
  // Helper function to add footer and page number
  const addPageNumber = (pageNum: number, total: number) => {
    // Footer text above page number
    const footerText = '© 2025 WAINSO GPS & Security System. All rights reserved. | Est. 2017 | 8+ Years in Business';
    doc.setFontSize(fontSizeSmall);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Page number below footer text
    doc.text(`Page ${pageNum} of ${total}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  };
  
  // Calculate available space for items table (leave space for totals and footer on last page)
  const spaceForTotals = 80; // Approximate space needed for totals, bank details, etc.
  const availableHeight = pageHeight - titleY - spaceForTotals - margin;
  const rowHeight = 6; // Approximate height per row
  const headerHeight = 8; // Height for table header
  const maxRowsPerPage = Math.floor((availableHeight - headerHeight) / rowHeight);
  const itemsPerPage = Math.max(8, Math.min(maxRowsPerPage, 15)); // At least 8, max 15 items per page
  
  // Split items into pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;
  let itemIndex = 0;
  let lastTableFinalY = titleY;

  // Process items in chunks
  while (itemIndex < items.length) {
    // If not first page, add new page and repeat full header
    if (currentPage > 1) {
      doc.addPage();
      
      // Repeat complete header on new page
      lastTableFinalY = drawProposalHeader(
        doc,
        proposal,
        companySettings,
        pageWidth,
        margin,
        fontSize,
        fontSizeTitle,
        fontSizeHeading
      );
    }

    // Get items for current page
    const pageItems = items.slice(itemIndex, itemIndex + itemsPerPage);
    const tableData = pageItems.map((item, idx) => [
      (itemIndex + idx + 1).toString(),
      item.hsn_code || '',
      item.description || '',
      formatNumberOnly(item.price),
      formatNumberOnly(item.quantity),
      formatNumberOnly(item.quantity * item.price)
    ]);

    // Determine if this is the last page
    const isLastPage = currentPage === totalPages;
  
    autoTable(doc, {
      startY: lastTableFinalY,
      head: [['S.NO', 'HSN CODE', 'DESCRIPTION', 'Price', 'Qty', 'AMOUNT']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 103, 103], // #006767
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: fontSize
      },
      styles: { 
        fontSize: fontSize,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.06, halign: 'center' },
        1: { cellWidth: tableWidth * 0.12, halign: 'left' },
        2: { cellWidth: tableWidth * 0.40, halign: 'left' },
        3: { cellWidth: tableWidth * 0.14, halign: 'right' },
        4: { cellWidth: tableWidth * 0.10, halign: 'right' },
        5: { cellWidth: tableWidth * 0.18, halign: 'right' }
      },
      didParseCell: (data: any) => {
        // Right-align headers for Price, Qty, and AMOUNT columns
        if (data.section === 'head') {
          if (data.column.index === 3 || data.column.index === 4 || data.column.index === 5) {
            data.cell.styles.halign = 'right';
          }
        }
      },
      margin: { left: margin, right: margin }
    });

    lastTableFinalY = (doc as any).lastAutoTable.finalY + 10;
    itemIndex += itemsPerPage;
    
    // Add page number on intermediate pages
    if (!isLastPage) {
      addPageNumber(currentPage, totalPages);
    }
    
    currentPage++;
  }

  const itemsTableFinalY = lastTableFinalY;
  
  // Totals Section - Start below items table, styled like table items
  const totalsTableData: string[][] = [];
  
  // Subtotal (first row)
  totalsTableData.push(['SUBTOTAL', formatNumberOnly(proposal.subtotal)]);
  
  // GST
  if (proposal.tax_amount > 0) {
    totalsTableData.push([`GST ${proposal.tax_rate}%`, formatNumberOnly(proposal.tax_amount)]);
  }
  
  // Discount
  if (proposal.discount > 0) {
    totalsTableData.push(['DISCOUNT', formatNumberOnly(proposal.discount)]);
  }
  
  // Final TOTAL
  totalsTableData.push(['TOTAL', formatNumberOnly(proposal.total)]);
  
  // Calculate totals table width (same as items table)
  const totalsTableWidth = tableWidth * 0.28; // Label + Value columns
  const totalsTableStartX = pageWidth - margin - totalsTableWidth;
  
  autoTable(doc, {
    startY: itemsTableFinalY,
    head: [['', '']],
    body: totalsTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: 255, 
      fontStyle: 'bold',
      fontSize: fontSize,
      lineWidth: 0
    },
    bodyStyles: {
      fontSize: fontSize,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: totalsTableWidth * 0.5, halign: 'left', fontStyle: 'normal' },
      1: { cellWidth: totalsTableWidth * 0.5, halign: 'right', fontStyle: 'normal' }
    },
    margin: { left: totalsTableStartX, right: margin },
    showHead: 'never',
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    }
  });
  
  const totalsFinalY = (doc as any).lastAutoTable.finalY;
  let totalsY = totalsFinalY;

  // Amount in Words - Improved styling
  totalsY += 10;
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 103, 103); // #006767
  doc.text('Amount in Words:', margin, totalsY);
  totalsY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const amountInWords = numberToWords(proposal.total);
  const wordsLines = doc.splitTextToSize(amountInWords, pageWidth - (margin * 2));
  doc.text(wordsLines, margin, totalsY);
  totalsY += wordsLines.length * 4 + 10;

  // Bank Account Details - Improved styling
  if (companySettings.bank_name || companySettings.bank_account_number) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 103, 103); // #006767
    doc.text('Account Details', margin, totalsY);
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (companySettings.bank_account_name || companySettings.company_name) {
      doc.text(`NAME: ${companySettings.bank_account_name || companySettings.company_name}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_account_number) {
      doc.text(`ACC/NO: ${companySettings.bank_account_number}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_ifsc) {
      doc.text(`IFSC: ${companySettings.bank_ifsc}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_name) {
      doc.text(`BANK: ${companySettings.bank_name}`, margin, totalsY);
      totalsY += 4;
    }
    if (companySettings.bank_branch) {
      const branchLine = `BRANCH: ${companySettings.bank_branch}`;
      if (companySettings.postal_code) {
        doc.text(`${branchLine}, ${companySettings.postal_code}`, margin, totalsY);
      } else {
        doc.text(branchLine, margin, totalsY);
      }
      totalsY += 4;
    }
  }

  // Authorized Signature - Bottom Right (only if there's space)
  const signatureY = totalsY + 15;
  if (signatureY < pageHeight - 20) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.text('Authorized Signature', pageWidth - margin, signatureY, { align: 'right' });
  }

  // Terms and Notes (only if there's enough space, otherwise skip to avoid unnecessary page break)
  let termsY = signatureY + 10;
  if (termsY > pageHeight - 30) {
    // Not enough space, skip terms/notes to avoid unnecessary page break
    termsY = pageHeight;
  }
  
  if (proposal.terms && termsY < pageHeight - 30) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin, termsY);
    termsY += 4;
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(proposal.terms, pageWidth - (margin * 2));
    // Only show terms if they fit on the page
    const termsHeight = termsLines.length * 4;
    if (termsY + termsHeight < pageHeight - 20) {
      doc.text(termsLines, margin, termsY);
      termsY += termsHeight;
    }
  }

  if (proposal.notes && termsY < pageHeight - 30) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, termsY);
    termsY += 4;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(proposal.notes, pageWidth - (margin * 2));
    // Only show notes if they fit on the page
    const notesHeight = notesLines.length * 4;
    if (termsY + notesHeight < pageHeight - 20) {
      doc.text(notesLines, margin, termsY);
    }
  }

  // Footer - Only on last page (if different from standard footer)
  if (companySettings.footer_text && companySettings.footer_text !== '© 2025 WAINSO GPS & Security System. All rights reserved. | Est. 2017 | 8+ Years in Business') {
    const footerY = pageHeight - 12;
    doc.setFontSize(fontSizeSmall);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(companySettings.footer_text, pageWidth / 2, footerY, { align: 'center' });
  }

  // Add footer text and page number on last page
  addPageNumber(totalPages, totalPages);

  return doc;
}
