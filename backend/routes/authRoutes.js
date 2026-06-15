import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authControllers.js';
import { protect } from '../middleware/authMiddlewere.js';
import { body } from 'express-validator';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;