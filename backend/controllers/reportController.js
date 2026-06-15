import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [
      totalProducts,
      totalCategories,
      totalSales,
      totalCustomers,
      todaySales,
      weeklySales,
      monthlySales,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Sale.countDocuments(),
      (await import('../models/Customer.js')).default.countDocuments(),
      Sale.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      Product.countDocuments({ 
        isActive: true,
        $expr: { $and: [
          { $gt: ['$quantity', 0] },
          { $lte: ['$quantity', '$minStockLevel'] }
        ]}
      }),
      Product.countDocuments({ isActive: true, quantity: 0 })
    ]);

    res.json({
      totalProducts,
      totalCategories,
      totalSales,
      totalCustomers,
      todayRevenue: todaySales[0]?.total || 0,
      todaySales: todaySales[0]?.count || 0,
      weeklyRevenue: weeklySales[0]?.total || 0,
      weeklySales: weeklySales[0]?.count || 0,
      monthlyRevenue: monthlySales[0]?.total || 0,
      monthlySales: monthlySales[0]?.count || 0,
      lowStockProducts,
      outOfStockProducts
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          sales: { $sum: 1 },
          items: { $sum: { $size: '$items' } },
          avgOrderValue: { $avg: '$grandTotal' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const paymentMethods = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          count: 1,
          totalStock: 1,
          totalValue: 1
        }
      }
    ]);

    res.json({
      salesData,
      paymentMethods,
      topProducts,
      categoryDistribution
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('name');

    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
    
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel);
    const outOfStock = products.filter(p => p.quantity === 0);

    res.json({
      products,
      summary: {
        totalProducts: products.length,
        totalStock,
        totalValue,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportSalesPDF = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    let query = { status: 'completed' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;

    const sales = await Sale.find(query)
      .populate('soldBy', 'name')
      .sort('-createdAt');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `sales-report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    if (startDate || endDate) {
      doc.text(`Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Today'}`, { align: 'center' });
    }
    doc.moveDown();

    // Summary
    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    doc.fontSize(14).text(`Total Sales: ${sales.length}`, { continued: false });
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.text(`Average Order Value: ₹${(totalRevenue / sales.length || 0).toFixed(2)}`);
    doc.moveDown();

    // Table
    const tableTop = doc.y;
    const headers = ['Invoice #', 'Date', 'Customer', 'Items', 'Total', 'Payment'];
    const columnWidth = [100, 80, 120, 60, 80, 80];

    // Table Header
    doc.fontSize(10).font('Helvetica-Bold');
    let xPosition = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, tableTop, { width: columnWidth[i], align: 'left' });
      xPosition += columnWidth[i];
    });

    // Draw line
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table Rows
    doc.font('Helvetica');
    let yPosition = tableTop + 30;
    sales.forEach(sale => {
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
      }

      xPosition = 50;
      const rowData = [
        sale.invoiceNumber,
        new Date(sale.createdAt).toLocaleDateString(),
        sale.customerName.substring(0, 20),
        sale.items.length.toString(),
        `₹${sale.grandTotal.toFixed(2)}`,
        sale.paymentMethod.toUpperCase()
      ];

      rowData.forEach((data, i) => {
        doc.text(data, xPosition, yPosition, { width: columnWidth[i] });
        xPosition += columnWidth[i];
      });

      yPosition += 25;
    });

    // Footer
    doc.moveDown();
    doc.fontSize(8).text('This is a computer-generated report', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const exportSalesExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    let query = { status: 'completed' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;

    const sales = await Sale.find(query)
      .populate('soldBy', 'name')
      .sort('-createdAt');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Inventory Management System';
    
    // Sales Summary Sheet
    const summarySheet = workbook.addWorksheet('Sales Summary');
    summarySheet.columns = [
      { header: 'Invoice #', key: 'invoiceNumber', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Customer Mobile', key: 'customerMobile', width: 15 },
      { header: 'Items Count', key: 'itemsCount', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Grand Total', key: 'grandTotal', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Sold By', key: 'soldBy', width: 20 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    sales.forEach(sale => {
      summarySheet.addRow({
        invoiceNumber: sale.invoiceNumber,
        date: new Date(sale.createdAt).toLocaleDateString(),
        customerName: sale.customerName,
        customerMobile: sale.customerMobile,
        itemsCount: sale.items.length,
        subtotal: sale.subtotal,
        discount: sale.totalDiscount,
        tax: sale.totalTax,
        grandTotal: sale.grandTotal,
        paymentMethod: sale.paymentMethod.toUpperCase(),
        soldBy: sale.soldBy?.name || 'N/A',
        status: sale.status
      });
    });

    // Summary row
    const lastRow = summarySheet.lastRow.number + 2;
    summarySheet.getCell(`A${lastRow}`).value = 'TOTAL';
    summarySheet.getCell(`A${lastRow}`).font = { bold: true };
    summarySheet.getCell(`F${lastRow}`).value = sales.reduce((sum, s) => sum + s.subtotal, 0);
    summarySheet.getCell(`H${lastRow}`).value = sales.reduce((sum, s) => sum + s.totalTax, 0);
    summarySheet.getCell(`I${lastRow}`).value = sales.reduce((sum, s) => sum + s.grandTotal, 0);

    // Style header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
      bgColor: { argb: 'FF3B82F6' }
    };
    summarySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Items Detail Sheet
    const detailSheet = workbook.addWorksheet('Items Detail');
    detailSheet.columns = [
      { header: 'Invoice #', key: 'invoiceNumber', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Product Name', key: 'productName', width: 25 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Discount', key: 'discount', width: 12 },
      { header: 'Tax', key: 'tax', width: 12 },
      { header: 'Total', key: 'total', width: 12 }
    ];

    sales.forEach(sale => {
      sale.items.forEach(item => {
        detailSheet.addRow({
          invoiceNumber: sale.invoiceNumber,
          date: new Date(sale.createdAt).toLocaleDateString(),
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
          total: item.total
        });
      });
    });

    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };
    detailSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const exportInventoryPDF = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('name');

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    const filename = `inventory-report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Inventory Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    doc.fontSize(12);
    doc.text(`Total Products: ${products.length}`);
    doc.text(`Total Stock: ${totalStock} units`);
    doc.text(`Total Value: ₹${totalValue.toFixed(2)}`);
    doc.text(`Low Stock Items: ${lowStock}`);
    doc.text(`Out of Stock Items: ${outOfStock}`);
    doc.moveDown();

    // Table
    const headers = ['Product', 'SKU', 'Category', 'Qty', 'Min Stock', 'Status', 'Price', 'Value'];
    const columnWidth = [120, 80, 80, 50, 60, 70, 70, 70];

    doc.fontSize(8).font('Helvetica-Bold');
    let xPosition = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, doc.y, { width: columnWidth[i], align: 'left' });
      xPosition += columnWidth[i];
    });

    doc.moveTo(50, doc.y + 15).lineTo(750, doc.y + 15).stroke();

    doc.font('Helvetica');
    let yPosition = doc.y + 20;

    products.forEach(product => {
      if (yPosition > 550) {
        doc.addPage();
        yPosition = 50;
      }

      const status = product.quantity === 0 ? 'OUT' : 
                     product.quantity <= product.minStockLevel ? 'LOW' : 'OK';

      xPosition = 50;
      const rowData = [
        product.name.substring(0, 25),
        product.sku,
        product.category?.name || 'N/A',
        product.quantity.toString(),
        product.minStockLevel.toString(),
        status,
        `₹${product.sellingPrice}`,
        `₹${(product.quantity * product.sellingPrice).toFixed(2)}`
      ];

      rowData.forEach((data, i) => {
        doc.text(data, xPosition, yPosition, { width: columnWidth[i] });
        xPosition += columnWidth[i];
      });

      yPosition += 20;
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const exportInventoryExcel = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('name');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    worksheet.columns = [
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Barcode', key: 'barcode', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Min Stock Level', key: 'minStock', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 15 },
      { header: 'Selling Price', key: 'sellingPrice', width: 15 },
      { header: 'Stock Value', key: 'stockValue', width: 15 }
    ];

    products.forEach(product => {
      const status = product.quantity === 0 ? 'Out of Stock' : 
                     product.quantity <= product.minStockLevel ? 'Low Stock' : 'In Stock';

      worksheet.addRow({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || 'N/A',
        category: product.category?.name || 'N/A',
        brand: product.brand || 'N/A',
        quantity: product.quantity,
        minStock: product.minStockLevel,
        status,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stockValue: product.quantity * product.sellingPrice
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Conditional formatting for status
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell(8);
        if (statusCell.value === 'Out of Stock') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }
          };
        } else if (statusCell.value === 'Low Stock') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }
          };
        }
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory-report-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};