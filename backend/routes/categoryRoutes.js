import express from 'express';
import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { categoryValidationRules } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('admin', 'manager'), categoryValidationRules, createCategory);

router.get('/all', protect, getAllCategories);
router.get('/search', protect, getCategories);

router.route('/:id')
  .get(protect, getCategory)
  .put(protect, authorize('admin', 'manager'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;