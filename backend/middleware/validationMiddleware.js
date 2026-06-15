import { body, param, query, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
      field: err.path,
      message: err.msg 
    }));

    return res.status(422).json({
      errors: extractedErrors
    });
  };
};

// Common validation rules
export const productValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
  body('barcode')
    .optional()
    .trim()
    .matches(/^[0-9]+$/)
    .withMessage('Barcode must contain only numbers'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters'),
  body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('taxPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax percentage must be between 0 and 100'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a positive integer')
];

export const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

export const customerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Invalid mobile number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

export const saleValidationRules = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  body('paymentMethod')
    .isIn(['cash', 'upi', 'card', 'mixed'])
    .withMessage('Invalid payment method'),
  body('paymentDetails')
    .optional()
    .isObject()
    .withMessage('Invalid payment details')
];

export const userValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Invalid phone number')
];