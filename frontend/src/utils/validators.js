export const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const validateMobile = (mobile) => {
  const re = /^[0-9]{10}$/;
  return re.test(mobile);
};

export const validateSKU = (sku) => {
  const re = /^[A-Z0-9-]+$/;
  return re.test(sku);
};

export const validateBarcode = (barcode) => {
  if (!barcode) return true; // Optional field
  const re = /^[0-9]+$/;
  return re.test(barcode);
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return re.test(password);
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
  if (password.match(/\d/)) strength++;
  if (password.match(/[^a-zA-Z\d]/)) strength++;
  
  return {
    score: strength,
    label: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] || 'Very Weak',
    color: ['red', 'orange', 'yellow', 'blue', 'green'][strength] || 'red',
  };
};

export const validateProductForm = (data) => {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Product name is required';
  if (!data.sku?.trim()) errors.sku = 'SKU is required';
  if (!validateSKU(data.sku)) errors.sku = 'Invalid SKU format';
  if (data.barcode && !validateBarcode(data.barcode)) errors.barcode = 'Invalid barcode';
  if (!data.category) errors.category = 'Category is required';
  if (!data.purchasePrice || data.purchasePrice < 0) errors.purchasePrice = 'Valid purchase price required';
  if (!data.sellingPrice || data.sellingPrice < 0) errors.sellingPrice = 'Valid selling price required';
  if (data.taxPercentage < 0 || data.taxPercentage > 100) errors.taxPercentage = 'Tax must be between 0-100%';
  if (data.quantity < 0) errors.quantity = 'Quantity cannot be negative';
  if (data.minStockLevel < 0) errors.minStockLevel = 'Min stock level cannot be negative';

  return errors;
};

export const validateCustomerForm = (data) => {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Customer name is required';
  if (!data.mobile?.trim()) errors.mobile = 'Mobile number is required';
  if (!validateMobile(data.mobile)) errors.mobile = 'Invalid mobile number';
  if (data.email && !validateEmail(data.email)) errors.email = 'Invalid email address';

  return errors;
};

export const validateSaleForm = (data) => {
  const errors = {};

  if (!data.items || data.items.length === 0) errors.items = 'At least one item is required';
  if (!data.paymentMethod) errors.paymentMethod = 'Payment method is required';

  return errors;
};