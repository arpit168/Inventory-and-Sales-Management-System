import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

class InventoryService {
  async getInventoryOverview(queryParams) {
    const { page = 1, limit = 10, search, sortBy } = queryParams;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name sku quantity minStockLevel sellingPrice category')
        .populate('category', 'name')
        .sort(sortBy || 'name')
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$minStockLevel'] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    return {
      products,
      stats: stats[0] || {
        totalStock: 0,
        totalValue: 0,
        lowStock: 0,
        outOfStock: 0
      },
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    };
  }

  async adjustStock(productId, adjustment, userId, notes = '') {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + adjustment;

    if (newQuantity < 0) {
      throw new Error('Stock cannot be negative');
    }

    product.quantity = newQuantity;
    product.history.push({
      action: adjustment > 0 ? 'stock_added' : 'stock_removed',
      quantity: Math.abs(adjustment),
      previousQuantity,
      newQuantity,
      performedBy: userId,
      notes: notes || `Manual stock ${adjustment > 0 ? 'increase' : 'decrease'}`
    });

    await product.save();

    // Check stock levels
    if (product.quantity <= product.minStockLevel) {
      await Notification.create({
        type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
        title: product.quantity === 0 ? 'Out of Stock' : 'Low Stock Alert',
        message: `${product.name} has ${product.quantity} units remaining`,
        data: { productId: product._id, quantity: product.quantity },
        userId
      });
    }

    return product;
  }

  async getInventoryHistory(productId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;
    const skip = (page - 1) * limit;

    const product = await Product.findById(productId)
      .select('history name sku')
      .populate('history.performedBy', 'name');

    if (!product) {
      throw new Error('Product not found');
    }

    const history = product.history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + limit);

    return {
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku
      },
      history,
      page: parseInt(page),
      pages: Math.ceil(product.history.length / limit),
      total: product.history.length
    };
  }

  async getLowStockAlerts() {
    const products = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
    .populate('category', 'name')
    .sort('quantity');

    return products;
  }

  async getOutOfStockProducts() {
    return await Product.find({
      isActive: true,
      quantity: 0
    })
    .populate('category', 'name')
    .sort('name');
  }
}

export default new InventoryService();