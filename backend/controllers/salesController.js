import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const unique = uuidv4().split('-')[0].toUpperCase();
  return `INV-${year}${month}${day}-${unique}`;
};

export const createSale = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, customer, customerName, customerMobile, paymentMethod, paymentDetails } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      const unitPrice = product.sellingPrice;
      const itemDiscount = (item.discount || 0) * item.quantity;
      const itemTotal = (unitPrice * item.quantity) - itemDiscount;
      const itemTax = (itemTotal * product.taxPercentage) / 100;

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        tax: itemTax,
        total: itemTotal + itemTax
      });

      subtotal += unitPrice * item.quantity;
      totalDiscount += itemDiscount;
      totalTax += itemTax;

      // Decrease inventory
      product.quantity -= item.quantity;
      product.history.push({
        action: 'stock_removed',
        quantity: item.quantity,
        previousQuantity: product.quantity + item.quantity,
        newQuantity: product.quantity,
        performedBy: req.user._id,
        notes: `Sold in invoice ${generateInvoiceNumber()}`
      });

      await product.save();

      // Check for low stock
      if (product.quantity <= product.minStockLevel) {
        await Notification.create({
          type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
          title: product.quantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
          message: `${product.name} has ${product.quantity} units remaining`,
          data: { productId: product._id },
          userId: req.user._id
        });
      }
    }

    const grandTotal = subtotal - totalDiscount + totalTax;
    const invoiceNumber = generateInvoiceNumber();

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
      soldBy: req.user._id
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
      message: `Sale completed. Invoice: ${invoiceNumber}, Total: ₹${grandTotal}`,
      data: { saleId: sale._id, invoiceNumber, total: grandTotal },
      userId: req.user._id
    });

    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    // Payment method filter
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    const sales = await Sale.find(query)
      .populate('soldBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Sale.countDocuments(query);

    // Calculate totals for the filtered period
    const totals = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$grandTotal' },
          totalTax: { $sum: '$totalTax' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      sales,
      page,
      pages: Math.ceil(total / limit),
      total,
      summary: totals[0] || { totalSales: 0, totalTax: 0, count: 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name sku image')
      .populate('customer', 'name mobile email')
      .populate('soldBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product')
      .populate('customer')
      .populate('soldBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    next(error);
  }
};