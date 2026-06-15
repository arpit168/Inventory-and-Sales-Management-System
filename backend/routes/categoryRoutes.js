import express from 'express';
import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { categoryValidationRules, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes (protected)
router.use(protect);

// Get all categories with pagination and search
router.route('/')
  .get(getCategories)
  .post(
    authorize('admin', 'manager'),
    validate(categoryValidationRules),
    createCategory
  );

// Get all categories without pagination (for dropdowns)
router.get('/all', getAllCategories);

// Search categories
router.get('/search', getCategories);

// Get single category
router.route('/:id')
  .get(getCategory)
  .put(
    authorize('admin', 'manager'),
    validate(categoryValidationRules),
    updateCategory
  )
  .delete(
    authorize('admin'),
    deleteCategory
  );

// Get products by category
router.get('/:id/products', getCategoryProducts);

export default router;