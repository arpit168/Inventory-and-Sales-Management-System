import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductHistory
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'manager'), upload.single('image'), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('purchasePrice').isFloat({ min: 0 }).withMessage('Valid purchase price is required'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
    body('category').notEmpty().withMessage('Category is required')
  ], createProduct);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'manager'), upload.single('image'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.get('/:id/history', protect, getProductHistory);

export default router;