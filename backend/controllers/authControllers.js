import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Set token cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'staff' // Default role for self-registration
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'user_login',
      entity: 'user',
      entityId: user._id,
      description: 'New user registered',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Check if user exists
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is locked
    if (user.isLocked()) {
      return next(new AppError('Account is temporarily locked. Please try again later.', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact administrator.', 401));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      return next(new AppError('Invalid email or password', 401));
    }

    // Reset login attempts on successful login
    await user.updateOne({
      $set: { 
        loginAttempts: 0,
        lastLogin: new Date() 
      },
      $unset: { lockUntil: 1 }
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'user_login',
      entity: 'user',
      entityId: user._id,
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar from cloudinary if exists
        if (user.avatar && user.avatar.includes('cloudinary')) {
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
        }

        // Upload new avatar
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'avatars',
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face'
        });
        user.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Continue without updating avatar
      }
    }

    const updatedUser = await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'settings_updated',
      entity: 'user',
      entityId: user._id,
      description: 'Profile updated',
      ipAddress: req.ip
    });

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'settings_updated',
      entity: 'user',
      entityId: user._id,
      description: 'Password changed',
      ipAddress: req.ip
    });

    // Send new token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'user_logout',
      entity: 'user',
      entityId: req.user._id,
      description: 'User logged out',
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};