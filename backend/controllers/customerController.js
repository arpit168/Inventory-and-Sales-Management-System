import Customer from '../models/Customer.js';
import { validationResult } from 'express-validator';

export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query)
    ]);

    res.json({
      customers,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const searchCustomer = async (req, res, next) => {
  try {
    const { mobile } = req.query;
    
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const customer = await Customer.findOne({ mobile });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('purchaseHistory.sale');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile, email, address } = req.body;

    const existingCustomer = await Customer.findOne({ mobile });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this mobile number already exists' });
    }

    const customer = await Customer.create({ name, mobile, email, address });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { name, mobile, email, address } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (mobile && mobile !== customer.mobile) {
      const existingCustomer = await Customer.findOne({ mobile });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Mobile number already in use' });
      }
    }

    customer.name = name || customer.name;
    customer.mobile = mobile || customer.mobile;
    customer.email = email || customer.email;
    customer.address = address || customer.address;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCustomerPurchaseHistory = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select('name mobile purchaseHistory')
      .populate({
        path: 'purchaseHistory.sale',
        select: 'invoiceNumber grandTotal createdAt paymentMethod'
      });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};