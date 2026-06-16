import express from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryReport,
  exportSalesPDF,
  exportSalesExcel,
  exportInventoryPDF,
  exportInventoryExcel
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddlewere.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/sales-analytics', protect, getSalesAnalytics);
router.get('/inventory-report', protect, getInventoryReport);

// Export routes
router.get('/export/sales/pdf', protect, exportSalesPDF);
router.get('/export/sales/excel', protect, exportSalesExcel);
router.get('/export/inventory/pdf', protect, exportInventoryPDF);
router.get('/export/inventory/excel', protect, exportInventoryExcel);

export default router;