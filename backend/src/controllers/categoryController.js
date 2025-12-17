import asyncHandler from '../middleware/asyncHandler.js';
import Category from '../models/Category.js';
import { logAdminActivity } from '../utils/activityLogger.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * @desc    Get all categories (including inactive) - Admin only
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  res.json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Create category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'created category',
      resourceType: 'category',
      resourceId: category._id,
      details: `Created category: ${category.name}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.status(201).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    const changes = Object.keys(req.body).join(', ');
    await logAdminActivity({
      adminId: req.user._id,
      action: 'updated category',
      resourceType: 'category',
      resourceId: category._id,
      details: `Updated category: ${category.name}. Changed fields: ${changes}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  const categoryName = category.name;
  const categoryId = category._id;

  await category.deleteOne();

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'deleted category',
      resourceType: 'category',
      resourceId: categoryId,
      details: `Deleted category: ${categoryName}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: {},
  });
});

