import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

class SalesService {
  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const unique = uuidv4().split('-')[0].toUpperCase();
    return `INV-${year}${month}${day}-${unique}`;
  }

  async createSale(saleData, userId) {
    const { items, customer, customerName, customerMobile, paymentMethod, paymentDetails } = saleData;

    // Process items and update inventory
    const processedItems = [];
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = product.sellingPrice;
      const itemDiscount = (item.discount || 0) * item.quantity;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTax = ((itemSubtotal - itemDiscount) * product.taxPercentage) / 100;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal
      });

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;

      // Update inventory
      product.quantity -= item.quantity;
      product.history.push({
        action: 'stock_removed',
        quantity: item.quantity,
        previousQuantity: product.quantity + item.quantity,
        newQuantity: product.quantity,
        performedBy: userId,
        notes: 'Sold'
      });

      await product.save();

      // Check low stock
      if (product.quantity <= product.minStockLevel) {
        await Notification.create({
          type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
          title: product.quantity === 0 ? 'Out of Stock' : 'Low Stock',
          message: `${product.name} has ${product.quantity} units remaining`,
          data: { productId: product._id, quantity: product.quantity }
        });
      }
    }

    // Handle customer
    let customerDoc = null;
    if (customer) {
      customerDoc = await Customer.findById(customer);
    } else if (customerMobile) {
      customerDoc = await Customer.findOne({ mobile: customerMobile });
      if (!customerDoc) {
        customerDoc = await Customer.create({
          name: customerName || 'Walk-in Customer',
          mobile: customerMobile
        });
      }
    }

    // Create sale
    const invoiceNumber = this.generateInvoiceNumber();
    const grandTotal = subtotal - totalDiscount + totalTax;

    const sale = await Sale.create({
      invoiceNumber,
      customer: customerDoc?._id,
      customerName: customerDoc?.name || customerName || 'Walk-in Customer',
      customerMobile: customerDoc?.mobile || customerMobile || 'N/A',
      items: processedItems,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      paymentMethod,
      paymentDetails,
      soldBy: userId
    });

    // Update customer purchase history
    if (customerDoc) {
      customerDoc.totalPurchases += grandTotal;
      customerDoc.purchaseHistory.push({
        sale: sale._id,
        date: new Date(),
        amount: grandTotal
      });
      await customerDoc.save();
    }

    // Create notification
    await Notification.create({
      type: 'sale_completed',
      title: 'Sale Completed',
      message: `Invoice ${invoiceNumber} - ₹${grandTotal.toFixed(2)}`,
      data: { saleId: sale._id, invoiceNumber, total: grandTotal },
      userId
    });

    return sale;
  }

  async getSales(queryParams) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      paymentMethod,
      sortBy = '-createdAt'
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('soldBy', 'name')
        .populate('customer', 'name mobile')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query)
    ]);

    // Calculate totals
    const totals = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$grandTotal' },
          totalTax: { $sum: '$totalTax' },
          totalDiscount: { $sum: '$totalDiscount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      sales,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      summary: totals[0] || {
        totalSales: 0,
        totalTax: 0,
        totalDiscount: 0,
        count: 0
      }
    };
  }

  async getSaleById(id) {
    const sale = await Sale.findById(id)
      .populate('items.product', 'name sku image')
      .populate('customer', 'name mobile email address')
      .populate('soldBy', 'name email');

    if (!sale) {
      throw new Error('Sale not found');
    }

    return sale;
  }

  async getInvoice(id) {
    const sale = await Sale.findById(id)
      .populate('items.product')
      .populate('customer')
      .populate('soldBy', 'name email');

    if (!sale) {
      throw new Error('Invoice not found');
    }

    return sale;
  }

  async cancelSale(id, userId) {
    const sale = await Sale.findById(id);
    
    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status !== 'completed') {
      throw new Error('Only completed sales can be cancelled');
    }

    // Restore inventory
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        product.history.push({
          action: 'stock_added',
          quantity: item.quantity,
          previousQuantity: product.quantity - item.quantity,
          newQuantity: product.quantity,
          performedBy: userId,
          notes: `Sale ${sale.invoiceNumber} cancelled`
        });
        await product.save();
      }
    }

    sale.status = 'cancelled';
    await sale.save();

    return sale;
  }
}

export default new SalesService();