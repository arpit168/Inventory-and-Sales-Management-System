import express from 'express';
import {
  getInventoryOverview,
  adjustStock,
  bulkAdjustStock,
  getInventoryHistory,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventoryValue
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddlewere.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Inventory overview
router.get('/overview', getInventoryOverview);
router.get('/value', getInventoryValue);

// Stock adjustments
router.post('/adjust', authorize('admin', 'manager'), adjustStock);
router.post('/bulk-adjust', authorize('admin', 'manager'), bulkAdjustStock);

// Stock history
router.get('/history/:productId', getInventoryHistory);

// Stock alerts
router.get('/low-stock', getLowStockProducts);
router.get('/out-of-stock', getOutOfStockProducts);

export default router;