import asyncHandler from '../middleware/asyncHandler.js';
import Subject from '../models/Subject.js';
import { logAdminActivity } from '../utils/activityLogger.js';

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Public
 */
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });

  res.json({
    success: true,
    count: subjects.length,
    data: subjects,
  });
});

/**
 * @desc    Get single subject
 * @route   GET /api/subjects/:id
 * @access  Public
 */
export const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return res.status(404).json({
      success: false,
      error: 'Subject not found',
    });
  }

  res.json({
    success: true,
    data: subject,
  });
});

/**
 * @desc    Create subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
export const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'created subject',
      resourceType: 'subject',
      resourceId: subject._id,
      details: `Created subject: ${subject.name}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.status(201).json({
    success: true,
    data: subject,
  });
});

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private/Admin
 */
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!subject) {
    return res.status(404).json({
      success: false,
      error: 'Subject not found',
    });
  }

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    const changes = Object.keys(req.body).join(', ');
    await logAdminActivity({
      adminId: req.user._id,
      action: 'updated subject',
      resourceType: 'subject',
      resourceId: subject._id,
      details: `Updated subject: ${subject.name}. Changed fields: ${changes}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: subject,
  });
});

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return res.status(404).json({
      success: false,
      error: 'Subject not found',
    });
  }

  const subjectName = subject.name;
  const subjectId = subject._id;

  await subject.deleteOne();

  // Log admin activity
  if (req.user && req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'deleted subject',
      resourceType: 'subject',
      resourceId: subjectId,
      details: `Deleted subject: ${subjectName}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: {},
  });
});

