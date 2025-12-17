import asyncHandler from '../middleware/asyncHandler.js';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import paymentService from '../services/paymentService.js';
import { logAdminActivity } from '../utils/activityLogger.js';

// Generate unique payment reference ID
const generatePaymentReferenceId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

/**
 * @desc    Create payment
 * @route   POST /api/payments
 * @access  Private/Student
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Check if already enrolled
  if (course.studentsEnrolled.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      error: 'You are already enrolled in this course',
    });
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({
    student: req.user._id,
    course: courseId,
    status: 'completed',
  });

  if (existingPayment) {
    return res.status(400).json({
      success: false,
      error: 'Payment already completed for this course',
    });
  }

  // Process payment (mock) - but set status to pending for admin verification
  const paymentResult = await paymentService.processPayment({
    amount: course.price,
    courseId,
    studentId: req.user._id,
  });

  // Create payment record with pending status (requires admin verification)
  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    transactionId: paymentResult.transactionId,
    amount: course.price,
    status: 'pending', // Require admin verification
    enrollmentCompleted: false,
  });

  res.status(201).json({
    success: true,
    data: payment,
  });
});

/**
 * @desc    Get payment history
 * @route   GET /api/payments
 * @access  Private/Student
 */
export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.user._id })
    .populate('course', 'title price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private/Student
 */
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('course', 'title price')
    .populate('student', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  // Make sure user owns this payment or is admin
  if (payment.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this payment',
    });
  }

  res.json({
    success: true,
    data: payment,
  });
});

/**
 * @desc    Get all payments (Admin only)
 * @route   GET /api/admin/payments
 * @access  Private/Admin
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  
  const query = {};
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate('student', 'name email')
    .populate('course', 'title price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    count: payments.length,
    total,
    data: payments,
  });
});

/**
 * @desc    Verify/Approve payment (Admin only)
 * @route   PUT /api/admin/payments/:id/verify
 * @access  Private/Admin
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('course', 'title')
    .populate('student', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  if (payment.status === 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Payment is already verified',
    });
  }

  // Verify payment
  payment.status = 'completed';
  payment.enrollmentCompleted = true;
  payment.verifiedBy = req.user._id;
  payment.verifiedAt = new Date();
  await payment.save();

  // Enroll student in course if not already enrolled
  const course = await Course.findById(payment.course._id);
  if (!course.studentsEnrolled.includes(payment.student._id)) {
    course.studentsEnrolled.push(payment.student._id);
    await course.save();

    // Add course to user's enrolled courses
    const user = await User.findById(payment.student._id);
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    // Create initial progress record
    await Progress.findOneAndUpdate(
      { student: payment.student._id, course: course._id },
      {
        student: payment.student._id,
        course: course._id,
        videosWatched: [],
        completionPercentage: 0,
        lastAccessed: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'verified payment',
    resourceType: 'payment',
    resourceId: payment._id,
    details: `Verified payment ${payment.transactionId} for course: ${course.title}, Student: ${payment.student.name}`,
    ipAddress: req.ip || req.connection.remoteAddress || '',
  });

  res.json({
    success: true,
    message: 'Payment verified and student enrolled successfully',
    data: payment,
  });
});

/**
 * @desc    Reject/Fail payment (Admin only)
 * @route   PUT /api/admin/payments/:id/reject
 * @access  Private/Admin
 */
export const rejectPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payment = await Payment.findById(req.params.id)
    .populate('course', 'title')
    .populate('student', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      error: 'Payment not found',
    });
  }

  if (payment.status === 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot reject a completed payment',
    });
  }

  // Reject payment
  payment.status = 'rejected';
  payment.rejectionReason = reason || '';
  await payment.save();

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'rejected payment',
    resourceType: 'payment',
    resourceId: payment._id,
    details: `Rejected payment ${payment.transactionId} for course: ${payment.course.title}, Student: ${payment.student.name}. Reason: ${reason || 'Not provided'}`,
    ipAddress: req.ip || req.connection.remoteAddress || '',
  });

  res.json({
    success: true,
    message: 'Payment rejected successfully',
    data: payment,
  });
});

/**
 * @desc    Submit manual payment (EasyPaisa/JazzCash)
 * @route   POST /api/payments/manual
 * @access  Private/Student
 */
export const submitManualPayment = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod, manualTransactionId } = req.body;

  // Validate payment method
  if (!['easypaisa', 'jazzcash', 'bank_transfer'].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment method. Must be easypaisa, jazzcash, or bank_transfer',
    });
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Check if already enrolled
  if (course.studentsEnrolled.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      error: 'You are already enrolled in this course',
    });
  }

  // Check for duplicate pending payment submission (allow resubmission if rejected)
  const existingPendingPayment = await Payment.findOne({
    student: req.user._id,
    course: courseId,
    status: 'pending',
  });

  if (existingPendingPayment) {
    return res.status(400).json({
      success: false,
      error: 'You already have a pending payment for this course. Please wait for admin approval.',
      paymentReferenceId: existingPendingPayment.paymentReferenceId,
    });
  }

  // Check for completed payment
  const existingCompletedPayment = await Payment.findOne({
    student: req.user._id,
    course: courseId,
    status: 'completed',
  });

  if (existingCompletedPayment) {
    return res.status(400).json({
      success: false,
      error: 'Payment already completed for this course',
    });
  }
  
  // Allow resubmission if previous payment was rejected or failed

  // Handle receipt image upload
  let receiptImagePath = '';
  if (req.file) {
    // Validate file size (max 5MB for receipts)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Receipt file size must be less than 5MB',
      });
    }
    receiptImagePath = `/uploads/receipts/${req.file.filename}`;
  }

  // Validate receipt is provided
  if (!receiptImagePath) {
    return res.status(400).json({
      success: false,
      error: 'Please upload payment receipt screenshot',
    });
  }

  // Validate transaction ID
  if (!manualTransactionId || manualTransactionId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Please provide transaction ID',
    });
  }

  // Generate unique payment reference ID
  const paymentReferenceId = generatePaymentReferenceId();

  // Generate transaction ID for internal tracking
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create payment record with pending status
  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    transactionId,
    paymentReferenceId,
    amount: course.price,
    currency: paymentMethod === 'bank_transfer' ? 'PKR' : 'PKR', // All manual payments use PKR
    status: 'pending',
    paymentMethod: paymentMethod,
    manualTransactionId: manualTransactionId.trim(),
    receiptImage: receiptImagePath,
    enrollmentCompleted: false,
  });

  res.status(201).json({
    success: true,
    message: 'Payment submitted successfully. Please wait for admin verification.',
    data: {
      ...payment.toObject(),
      paymentReferenceId,
    },
  });
});

