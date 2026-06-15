import express from 'express';
import { createSale, getSales, getSale, getInvoice } from '../controllers/salesController.js';
import { protect } from '../middleware/authMiddlewere.js';
import { body } from 'express-validator';

const router = express.Router();

router.route('/')
  .get(protect, getSales)
  .post(protect, [
    body('items').isArray().notEmpty().withMessage('Items are required'),
    body('paymentMethod').isIn(['cash', 'upi', 'card', 'mixed']).withMessage('Valid payment method is required')
  ], createSale);

router.get('/:id', protect, getSale);
router.get('/:id/invoice', protect, getInvoice);

export default router;