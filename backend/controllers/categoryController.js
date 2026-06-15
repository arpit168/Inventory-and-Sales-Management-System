import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

export const getCategories = async (req, res, next) => {
  try {
    const { 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'name'
    } = req.query;
    
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(query)
    ]);

    res.json({
      success: true,
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('name')
      .select('name description');
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get product count for this category
    const productCount = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    // Check for existing category
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      if (!existingCategory.isActive) {
        // Reactivate the category
        existingCategory.isActive = true;
        existingCategory.description = description || existingCategory.description;
        await existingCategory.save();
        
        return res.status(200).json({
          success: true,
          message: 'Category reactivated successfully',
          category: existingCategory
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({ name, description });

    // Create notification
    await Notification.create({
      type: 'product_added',
      title: 'New Category Created',
      message: `Category "${category.name}" has been created`,
      data: { 
        categoryId: category._id,
        categoryName: category.name 
      },
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const oldName = category.name;
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;

    const updatedCategory = await category.save();

    // If name changed, create notification
    if (name && name !== oldName) {
      await Notification.create({
        type: 'product_updated',
        title: 'Category Updated',
        message: `Category "${oldName}" renamed to "${updatedCategory.name}"`,
        data: { 
          categoryId: updatedCategory._id,
          oldName,
          newName: updatedCategory.name
        },
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} product(s) are associated with this category. Please reassign or delete those products first.`,
        productCount
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    // Create notification
    await Notification.create({
      type: 'product_deleted',
      title: 'Category Deleted',
      message: `Category "${category.name}" has been deleted`,
      data: { 
        categoryId: category._id,
        categoryName: category.name 
      },
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryProducts = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await Product.find({ 
      category: category._id, 
      isActive: true 
    })
    .select('name sku sellingPrice quantity image')
    .sort('name');

    res.json({
      success: true,
      category: {
        _id: category._id,
        name: category.name
      },
      products,
      totalProducts: products.length
    });
  } catch (error) {
    next(error);
  }
};