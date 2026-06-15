import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import env from '../config/env.js';

class AuthService {
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE }
    );
  }

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user._id);

    await this.logActivity(user._id, 'user_login', 'user', user._id, 'New user registration');

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      token
    };
  }

  async login(email, password, req) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = this.generateToken(user._id);

    await this.logActivity(
      user._id, 
      'user_login', 
      'user', 
      user._id, 
      'User logged in',
      req
    );

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId)
      .select('-password -__v');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId, updateData, avatarFile) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.password) user.password = updateData.password;
    if (avatarFile) user.avatar = avatarFile;

    const updatedUser = await user.save();

    await this.logActivity(
      userId,
      'settings_updated',
      'user',
      userId,
      'Profile updated'
    );

    return updatedUser;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    await this.logActivity(
      userId,
      'settings_updated',
      'user',
      userId,
      'Password changed'
    );

    return { message: 'Password updated successfully' };
  }

  async logActivity(userId, action, entity, entityId, description, req = null) {
    try {
      await ActivityLog.create({
        user: userId,
        action,
        entity,
        entityId,
        description,
        ipAddress: req?.ip,
        userAgent: req?.get('user-agent')
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export default new AuthService();