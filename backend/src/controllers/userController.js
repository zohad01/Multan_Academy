import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { logAdminActivity } from '../utils/activityLogger.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  const query = role ? { role } : {};

  const users = await User.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    total,
    data: users,
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    const changes = Object.keys(req.body).join(', ');
    await logAdminActivity({
      adminId: req.user._id,
      action: 'updated user',
      resourceType: user.role === 'teacher' ? 'teacher' : 'user',
      resourceId: user._id,
      details: `Updated fields: ${changes}. User: ${user.name} (${user.email})`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Prevent deleting admin accounts
  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Cannot delete admin accounts',
    });
  }

  // Check if teacher owns courses - handle DB consistency
  if (user.role === 'teacher') {
    const coursesCount = await Course.countDocuments({ teacher: user._id });
    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete teacher with ${coursesCount} course(s). Please reassign or delete courses first.`,
        coursesCount,
      });
    }
  }

  // Remove user from enrolled courses (for students)
  if (user.role === 'student' && user.enrolledCourses && user.enrolledCourses.length > 0) {
    await Course.updateMany(
      { _id: { $in: user.enrolledCourses } },
      { $pull: { studentsEnrolled: user._id } }
    );
  }

  const userInfo = {
    name: user.name,
    email: user.email,
    role: user.role,
    id: user._id,
  };

  await user.deleteOne();

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'deleted user',
      resourceType: userInfo.role === 'teacher' ? 'teacher' : 'user',
      resourceId: userInfo.id,
      details: `Deleted user: ${userInfo.name} (${userInfo.email}) - Role: ${userInfo.role}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
    data: {},
  });
});

