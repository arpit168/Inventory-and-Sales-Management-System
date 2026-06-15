import inventoryService from '../services/inventoryService.js';

export const getInventoryOverview = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventoryOverview(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustment, notes } = req.body;
    
    if (!productId || !adjustment) {
      return res.status(400).json({ 
        message: 'Product ID and adjustment amount are required' 
      });
    }

    const product = await inventoryService.adjustStock(
      productId, 
      adjustment, 
      req.user._id, 
      notes
    );

    res.json({
      message: 'Stock adjusted successfully',
      product: {
        _id: product._id,
        name: product.name,
        quantity: product.quantity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventoryHistory(
      req.params.productId,
      req.query
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await inventoryService.getLowStockAlerts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getOutOfStockProducts = async (req, res, next) => {
  try {
    const products = await inventoryService.getOutOfStockProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};