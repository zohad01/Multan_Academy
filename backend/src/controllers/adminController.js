import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import ActivityLog from '../models/ActivityLog.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalCourses = await Course.countDocuments();
  const totalSubjects = await Subject.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const enrolledStudents = await User.countDocuments({ enrolledCourses: { $exists: true, $ne: [] } });
  const pendingPayments = await Payment.countDocuments({ status: 'pending' });

  res.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      publishedCourses,
      enrolledStudents,
      pendingPayments,
    },
  });
});

/**
 * @desc    Get activity logs
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const logs = await ActivityLog.find()
    .populate('admin', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ActivityLog.countDocuments();

  res.json({
    success: true,
    count: logs.length,
    total,
    data: logs,
  });
});

/**
 * @desc    Create activity log
 * @route   POST /api/admin/activity-logs
 * @access  Private/Admin
 */
export const createActivityLog = asyncHandler(async (req, res) => {
  const { action, resourceType, resourceId, details } = req.body;

  const log = await ActivityLog.create({
    admin: req.user._id,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  res.status(201).json({
    success: true,
    data: log,
  });
});

