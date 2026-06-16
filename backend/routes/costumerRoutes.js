import express from 'express';
import {
  getCustomers,
  searchCustomer,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddlewere.js';
import { customerValidationRules } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomers)
  .post(protect, customerValidationRules, createCustomer);

router.get('/search', protect, searchCustomer);

router.route('/:id')
  .get(protect, getCustomer)
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

router.get('/:id/purchases', protect, getCustomerPurchaseHistory);

export default router;