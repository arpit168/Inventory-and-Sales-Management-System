import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary.js';

export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }
    
    // Filter by stock status
    if (req.query.stockStatus === 'low') {
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
      query.quantity = { $gt: 0 };
    } else if (req.query.stockStatus === 'out') {
      query.quantity = 0;
    }
    
    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.sellingPrice = {};
      if (req.query.minPrice) query.sellingPrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.sellingPrice.$lte = parseFloat(req.query.maxPrice);
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(req.query.sortBy || '-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('history.performedBy', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products',
        width: 800,
        height: 800,
        crop: 'fill'
      });
      productData.image = result.secure_url;
    }

    const product = await Product.create(productData);

    // Create notification
    await Notification.create({
      type: 'product_added',
      title: 'New Product Added',
      message: `Product "${product.name}" has been added`,
      data: { productId: product._id },
      userId: req.user._id
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldQuantity = product.quantity;
    const updates = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products',
        width: 800,
        height: 800,
        crop: 'fill'
      });
      updates.image = result.secure_url;
    }

    // Add history entry if quantity changed
    if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
      const historyEntry = {
        action: updates.quantity > oldQuantity ? 'stock_added' : 
                updates.quantity < oldQuantity ? 'stock_removed' : 'stock_adjusted',
        quantity: Math.abs(updates.quantity - oldQuantity),
        previousQuantity: oldQuantity,
        newQuantity: updates.quantity,
        performedBy: req.user._id,
        notes: updates.notes || 'Stock updated'
      };
      product.history.push(historyEntry);
    }

    // Check for low stock
    if (updates.quantity !== undefined && 
        updates.quantity <= (updates.minStockLevel || product.minStockLevel)) {
      await Notification.create({
        type: updates.quantity === 0 ? 'out_of_stock' : 'low_stock',
        title: updates.quantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
        message: `Product "${product.name}" is ${updates.quantity === 0 ? 'out of stock' : 'running low on stock'} (${updates.quantity} units remaining)`,
        data: { productId: product._id, quantity: updates.quantity },
        userId: req.user._id
      });
    }

    Object.assign(product, updates);
    const updatedProduct = await product.save();

    await Notification.create({
      type: 'product_updated',
      title: 'Product Updated',
      message: `Product "${updatedProduct.name}" has been updated`,
      data: { productId: updatedProduct._id },
      userId: req.user._id
    });

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = false;
    product.history.push({
      action: 'deleted',
      performedBy: req.user._id,
      notes: 'Product marked as deleted'
    });
    
    await product.save();

    await Notification.create({
      type: 'product_deleted',
      title: 'Product Deleted',
      message: `Product "${product.name}" has been deleted`,
      data: { productId: product._id },
      userId: req.user._id
    });

    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

export const getProductHistory = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('history')
      .populate('history.performedBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.history);
  } catch (error) {
    next(error);
  }
};  