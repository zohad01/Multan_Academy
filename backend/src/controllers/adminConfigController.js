import asyncHandler from '../middleware/asyncHandler.js';
import AdminConfig from '../models/AdminConfig.js';

/**
 * @desc    Get admin config
 * @route   GET /api/admin/config
 * @access  Private/Admin
 */
export const getAdminConfig = asyncHandler(async (req, res) => {
  const config = await AdminConfig.getConfig();

  res.json({
    success: true,
    data: config,
  });
});

/**
 * @desc    Update admin config
 * @route   PUT /api/admin/config
 * @access  Private/Admin
 */
export const updateAdminConfig = asyncHandler(async (req, res) => {
  let config = await AdminConfig.findOne();

  if (!config) {
    config = await AdminConfig.create(req.body);
  } else {
    config = await AdminConfig.findByIdAndUpdate(config._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.json({
    success: true,
    data: config,
  });
});

