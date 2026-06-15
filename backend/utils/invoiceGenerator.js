import PDFDocument from 'pdfkit';

export const generateInvoicePDF = async (sale, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const filename = `invoice-${sale.invoiceNumber}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Header Section
  doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
  doc.moveDown();
  
  // Company Details (customize with your company info)
  doc.fontSize(12).font('Helvetica');
  doc.text('Your Company Name', { align: 'left' });
  doc.text('123 Business Street', { align: 'left' });
  doc.text('City, State - 123456', { align: 'left' });
  doc.text('GST: 22AAAAA0000A1Z5', { align: 'left' });
  doc.moveDown();

  // Invoice Details
  doc.fontSize(10);
  const leftColumn = 50;
  const rightColumn = 350;

  doc.text(`Invoice Number: ${sale.invoiceNumber}`, leftColumn, doc.y);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, rightColumn, doc.y - 10);
  doc.moveDown();

  // Customer Details
  doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Name: ${sale.customerName}`);
  doc.text(`Mobile: ${sale.customerMobile}`);
  if (sale.customer?.email) {
    doc.text(`Email: ${sale.customer.email}`);
  }
  if (sale.customer?.address) {
    doc.text(`Address: ${sale.customer.address}`);
  }
  doc.moveDown();

  // Items Table
  const tableTop = doc.y;
  const tableHeaders = ['Item', 'Qty', 'Price', 'Tax', 'Total'];
  const tableWidth = [200, 70, 80, 80, 80];

  // Table Header
  doc.fontSize(10).font('Helvetica-Bold');
  let xPos = 50;
  tableHeaders.forEach((header, i) => {
    doc.text(header, xPos, tableTop, { width: tableWidth[i], align: i > 1 ? 'right' : 'left' });
    xPos += tableWidth[i];
  });

  // Draw line
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

  // Table Body
  doc.font('Helvetica');
  let yPos = tableTop + 30;

  sale.items.forEach(item => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    xPos = 50;
    const rowData = [
      item.productName,
      item.quantity.toString(),
      `₹${item.unitPrice.toFixed(2)}`,
      `₹${item.tax.toFixed(2)}`,
      `₹${item.total.toFixed(2)}`
    ];

    rowData.forEach((data, i) => {
      doc.text(data, xPos, yPos, { width: tableWidth[i], align: i > 1 ? 'right' : 'left' });
      xPos += tableWidth[i];
    });

    yPos += 25;
  });

  // Summary
  doc.moveDown();
  const summaryX = 350;
  doc.fontSize(10).font('Helvetica');
  
  doc.text('Subtotal:', summaryX, doc.y);
  doc.text(`₹${sale.subtotal.toFixed(2)}`, summaryX + 150, doc.y - 10, { align: 'right' });
  
  doc.text('Discount:', summaryX, doc.y + 5);
  doc.text(`₹${sale.totalDiscount.toFixed(2)}`, summaryX + 150, doc.y - 5, { align: 'right' });
  
  doc.text('Tax:', summaryX, doc.y + 5);
  doc.text(`₹${sale.totalTax.toFixed(2)}`, summaryX + 150, doc.y - 5, { align: 'right' });
  
  doc.moveDown();
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Grand Total:', summaryX, doc.y);
  doc.text(`₹${sale.grandTotal.toFixed(2)}`, summaryX + 150, doc.y - 15, { align: 'right' });

  // Payment Info
  doc.moveDown();
  doc.fontSize(10).font('Helvetica');
  doc.text(`Payment Method: ${sale.paymentMethod.toUpperCase()}`);
  doc.text(`Sold By: ${sale.soldBy?.name || 'N/A'}`);

  // Footer
  doc.moveDown();
  doc.fontSize(8).font('Helvetica').text('Thank you for your purchase!', { align: 'center' });
  doc.text('This is a computer-generated invoice', { align: 'center' });

  doc.end();
};