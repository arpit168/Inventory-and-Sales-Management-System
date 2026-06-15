import express from 'express';
import {
  getInventoryOverview,
  adjustStock,
  getInventoryHistory,
  getLowStockProducts,
  getOutOfStockProducts
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, getInventoryOverview);
router.post('/adjust', protect, adjustStock);
router.get('/history/:productId', protect, getInventoryHistory);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/out-of-stock', protect, getOutOfStockProducts);

export default router;