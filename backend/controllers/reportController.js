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
      todaySales,
      monthlySales,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Sale.countDocuments(),
      Sale.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Product.countDocuments({ 
        isActive: true,
        $expr: { $lte: ['$quantity', '$minStockLevel'] },
        quantity: { $gt: 0 }
      }),
      Product.countDocuments({ isActive: true, quantity: 0 })
    ]);

    res.json({
      totalProducts,
      totalCategories,
      totalSales,
      todayRevenue: todaySales[0]?.total || 0,
      monthlyRevenue: monthlySales[0]?.total || 0,
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
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          sales: { $sum: 1 },
          items: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
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
          count: { $sum: 1 }
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
          count: 1
        }
      }
    ]);

    res.json({
      salesData,
      topProducts,
      categoryDistribution
    });
  } catch (error) {
    next(error);
  }
};

export const exportSalesPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query).populate('soldBy', 'name').sort('-createdAt');

    const doc = new PDFDocument({ margin: 50 });
    const filename = `sales-report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    // Company Header
    doc.fontSize(20).text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const headers = ['Invoice #', 'Date', 'Customer', 'Items', 'Total', 'Payment'];
    const columnWidth = [100, 80, 120, 60, 80, 80];

    doc.fontSize(10);
    let xPosition = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, tableTop, { width: columnWidth[i], align: 'left' });
      xPosition += columnWidth[i];
    });

    // Draw line
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table Rows
    let yPosition = tableTop + 30;
    sales.forEach(sale => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      xPosition = 50;
      const rowData = [
        sale.invoiceNumber,
        new Date(sale.createdAt).toLocaleDateString(),
        sale.customerName,
        sale.items.length.toString(),
        `₹${sale.grandTotal.toFixed(2)}`,
        sale.paymentMethod
      ];

      rowData.forEach((data, i) => {
        doc.text(data, xPosition, yPosition, { width: columnWidth[i] });
        xPosition += columnWidth[i];
      });

      yPosition += 25;
    });

    // Summary
    doc.moveDown();
    doc.fontSize(12).text(`Total Sales: ₹${sales.reduce((sum, s) => sum + s.grandTotal, 0).toFixed(2)}`);
    doc.text(`Total Transactions: ${sales.length}`);

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const exportSalesExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query).populate('soldBy', 'name').sort('-createdAt');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Invoice #', key: 'invoiceNumber', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Items Count', key: 'itemsCount', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Grand Total', key: 'grandTotal', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Sold By', key: 'soldBy', width: 20 }
    ];

    // Add rows
    sales.forEach(sale => {
      worksheet.addRow({
        invoiceNumber: sale.invoiceNumber,
        date: new Date(sale.createdAt).toLocaleDateString(),
        customerName: sale.customerName,
        itemsCount: sale.items.length,
        subtotal: `₹${sale.subtotal}`,
        discount: `₹${sale.totalDiscount}`,
        tax: `₹${sale.totalTax}`,
        grandTotal: `₹${sale.grandTotal}`,
        paymentMethod: sale.paymentMethod,
        soldBy: sale.soldBy?.name || 'N/A'
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

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