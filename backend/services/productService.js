import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

class ProductService {
  async getProducts(queryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      brand,
      stockStatus,
      minPrice,
      maxPrice,
      sortBy = '-createdAt'
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    if (stockStatus === 'low') {
      query.quantity = { $gt: 0 };
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    } else if (stockStatus === 'out') {
      query.quantity = 0;
    }

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('history.performedBy', 'name')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return {
      products,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    };
  }

  async getProductById(id) {
    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('history.performedBy', 'name email');

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async createProduct(productData, userId) {
    const product = await Product.create(productData);

    // Create notification
    await Notification.create({
      type: 'product_added',
      title: 'New Product Added',
      message: `Product "${product.name}" (SKU: ${product.sku}) has been added to inventory`,
      data: { productId: product._id },
      userId
    });

    return product;
  }

  async updateProduct(id, updates, userId) {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Track quantity changes
    if (updates.quantity !== undefined && updates.quantity !== product.quantity) {
      const quantityDiff = updates.quantity - product.quantity;
      const action = quantityDiff > 0 ? 'stock_added' : 
                     quantityDiff < 0 ? 'stock_removed' : 'stock_adjusted';

      product.history.push({
        action,
        quantity: Math.abs(quantityDiff),
        previousQuantity: product.quantity,
        newQuantity: updates.quantity,
        performedBy: userId,
        notes: updates.notes || `Stock ${action.replace('_', ' ')}`
      });
    }

    Object.assign(product, updates);
    const updatedProduct = await product.save();

    // Check stock levels
    if (updatedProduct.quantity === 0) {
      await Notification.create({
        type: 'out_of_stock',
        title: 'Product Out of Stock',
        message: `${updatedProduct.name} is now out of stock`,
        data: { productId: updatedProduct._id },
        userId
      });
    } else if (updatedProduct.quantity <= updatedProduct.minStockLevel) {
      await Notification.create({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${updatedProduct.name} is running low (${updatedProduct.quantity} remaining)`,
        data: { productId: updatedProduct._id, quantity: updatedProduct.quantity },
        userId
      });
    }

    // Product update notification
    await Notification.create({
      type: 'product_updated',
      title: 'Product Updated',
      message: `Product "${updatedProduct.name}" has been updated`,
      data: { productId: updatedProduct._id },
      userId
    });

    return updatedProduct;
  }

  async deleteProduct(id, userId) {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    product.isActive = false;
    product.history.push({
      action: 'deleted',
      performedBy: userId,
      notes: 'Product marked as deleted'
    });
    
    await product.save();

    await Notification.create({
      type: 'product_deleted',
      title: 'Product Deleted',
      message: `Product "${product.name}" has been deleted`,
      data: { productId: product._id },
      userId
    });

    return product;
  }

  async getLowStockProducts() {
    return await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
    .populate('category', 'name')
    .sort('quantity');
  }

  async getOutOfStockProducts() {
    return await Product.find({
      isActive: true,
      quantity: 0
    })
    .populate('category', 'name')
    .sort('name');
  }

  async adjustStock(id, adjustment, userId) {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const previousQuantity = product.quantity;
    product.quantity += adjustment;

    if (product.quantity < 0) {
      throw new Error('Insufficient stock');
    }

    product.history.push({
      action: adjustment > 0 ? 'stock_added' : 'stock_removed',
      quantity: Math.abs(adjustment),
      previousQuantity,
      newQuantity: product.quantity,
      performedBy: userId,
      notes: 'Manual stock adjustment'
    });

    await product.save();
    return product;
  }

  async getProductHistory(id) {
    const product = await Product.findById(id)
      .select('history')
      .populate({
        path: 'history.performedBy',
        select: 'name email'
      });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.history.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export default new ProductService();