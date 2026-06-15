import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import inventoryService from '../services/inventoryService.js';

export const getInventoryOverview = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy,
      category,
      stockStatus 
    } = req.query;
    
    const skip = (page - 1) * limit;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (stockStatus === 'low') {
      query.quantity = { $gt: 0 };
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    } else if (stockStatus === 'out') {
      query.quantity = 0;
    } else if (stockStatus === 'in_stock') {
      query.quantity = { $gt: 0 };
    }

    const [products, total, stats] = await Promise.all([
      Product.find(query)
        .select('name sku barcode quantity minStockLevel sellingPrice purchasePrice category brand')
        .populate('category', 'name')
        .sort(sortBy || 'name')
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$quantity' },
            totalValue: { 
              $sum: { $multiply: ['$quantity', '$sellingPrice'] }
            },
            totalInvestment: {
              $sum: { $multiply: ['$quantity', '$purchasePrice'] }
            },
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
      ])
    ]);

    const summaryStats = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      totalInvestment: 0,
      lowStock: 0,
      outOfStock: 0
    };

    res.json({
      success: true,
      products,
      stats: summaryStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustment, notes } = req.body;
    
    if (!productId || adjustment === undefined || adjustment === null) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and adjustment amount are required'
      });
    }

    const adjustmentNum = parseInt(adjustment);
    if (isNaN(adjustmentNum) || adjustmentNum === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment must be a non-zero number'
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + adjustmentNum;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot adjust stock. Current stock is ${previousQuantity}. Adjustment of ${adjustmentNum} would result in negative stock.`,
        currentStock: previousQuantity
      });
    }

    product.quantity = newQuantity;
    product.history.push({
      action: adjustmentNum > 0 ? 'stock_added' : 'stock_removed',
      quantity: Math.abs(adjustmentNum),
      previousQuantity,
      newQuantity,
      performedBy: req.user._id,
      notes: notes || `Manual stock ${adjustmentNum > 0 ? 'increase' : 'decrease'}`
    });

    await product.save();

    // Check stock levels and create notifications if needed
    if (product.quantity === 0) {
      await Notification.create({
        type: 'out_of_stock',
        title: 'Product Out of Stock',
        message: `${product.name} (SKU: ${product.sku}) is now out of stock`,
        data: { 
          productId: product._id,
          productName: product.name,
          sku: product.sku
        },
        userId: req.user._id
      });
    } else if (product.quantity <= product.minStockLevel) {
      await Notification.create({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} (SKU: ${product.sku}) has only ${product.quantity} units remaining (minimum: ${product.minStockLevel})`,
        data: { 
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.quantity,
          minStockLevel: product.minStockLevel
        },
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        previousQuantity,
        newQuantity,
        adjustment: adjustmentNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkAdjustStock = async (req, res, next) => {
  try {
    const { adjustments } = req.body;
    
    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustments array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const adj of adjustments) {
      try {
        const product = await Product.findById(adj.productId);
        
        if (!product) {
          errors.push({
            productId: adj.productId,
            error: 'Product not found'
          });
          continue;
        }

        const newQuantity = product.quantity + adj.adjustment;
        if (newQuantity < 0) {
          errors.push({
            productId: adj.productId,
            productName: product.name,
            error: 'Insufficient stock'
          });
          continue;
        }

        product.quantity = newQuantity;
        product.history.push({
          action: adj.adjustment > 0 ? 'stock_added' : 'stock_removed',
          quantity: Math.abs(adj.adjustment),
          previousQuantity: product.quantity - adj.adjustment,
          newQuantity,
          performedBy: req.user._id,
          notes: adj.notes || 'Bulk stock adjustment'
        });

        await product.save();
        
        results.push({
          productId: product._id,
          productName: product.name,
          newQuantity
        });
      } catch (error) {
        errors.push({
          productId: adj.productId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Adjusted ${results.length} products successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const product = await Product.findById(productId)
      .select('name sku history')
      .populate({
        path: 'history.performedBy',
        select: 'name email'
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Sort history by timestamp descending
    const sortedHistory = product.history.sort((a, b) => b.timestamp - a.timestamp);
    const total = sortedHistory.length;
    const skip = (page - 1) * limit;
    const paginatedHistory = sortedHistory.slice(skip, skip + limit);

    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku
      },
      history: paginatedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      quantity: { $gt: 0 },
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort('quantity')
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOutOfStockProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      quantity: 0
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort('name')
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryValue = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          totalValue: { 
            $sum: { $multiply: ['$quantity', '$sellingPrice'] } 
          },
          totalCost: {
            $sum: { $multiply: ['$quantity', '$purchasePrice'] }
          },
          potentialProfit: {
            $sum: {
              $multiply: [
                '$quantity',
                { $subtract: ['$sellingPrice', '$purchasePrice'] }
              ]
            }
          }
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
          category: '$category.name',
          totalProducts: 1,
          totalStock: 1,
          totalValue: 1,
          totalCost: 1,
          potentialProfit: 1,
          profitMargin: {
            $cond: [
              { $gt: ['$totalValue', 0] },
              { $multiply: [{ $divide: ['$potentialProfit', '$totalValue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ];

    const categoryValues = await Product.aggregate(pipeline);

    const overallSummary = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          totalValue: { 
            $sum: { $multiply: ['$quantity', '$sellingPrice'] } 
          },
          totalCost: {
            $sum: { $multiply: ['$quantity', '$purchasePrice'] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      summary: overallSummary[0] || {
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        totalCost: 0
      },
      categoryValues
    });
  } catch (error) {
    next(error);
  }
};