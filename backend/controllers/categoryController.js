import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

export const getCategories = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort('name')
        .skip(skip)
        .limit(limit),
      Category.countDocuments(query)
    ]);

    res.json({
      categories,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, description });

    await Notification.create({
      type: 'product_added',
      title: 'Category Created',
      message: `Category "${category.name}" has been created`,
      data: { categoryId: category._id },
      userId: req.user._id
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const Product = (await import('../models/Product.js')).default;
    const productCount = await Product.countDocuments({ category: category._id, isActive: true });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productCount} products are associated with this category.` 
      });
    }

    category.isActive = false;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};