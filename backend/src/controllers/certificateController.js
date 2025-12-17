import asyncHandler from '../middleware/asyncHandler.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Subject from '../models/Subject.js';
import certificateService from '../services/certificateService.js';

/**
 * @desc    Generate certificate for completed course
 * @route   POST /api/certificates/generate/:courseId
 * @access  Private/Student
 */
export const generateCertificate = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate('teacher');

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Check enrollment
  if (!course.studentsEnrolled.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course',
    });
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (existingCertificate) {
    return res.json({
      success: true,
      data: existingCertificate,
    });
  }

  // Check course completion (100% progress)
  const progress = await Progress.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!progress || progress.completionPercentage < 100) {
    return res.status(400).json({
      success: false,
      error: 'Course must be 100% completed to generate certificate',
    });
  }

  // Get custom name from request body, or use user's name
  const customName = req.body.customName?.trim() || req.user.name;

  // Generate certificate ID and verification code
  const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const verificationCode = Math.random().toString(36).substr(2, 16).toUpperCase();

  // Get subject name for subject-wise certificate
  const subject = await Subject.findById(course.subject);
  const subjectName = subject ? subject.name : '';

  // Generate PDF
  const pdfResult = await certificateService.generateCertificate({
    studentName: customName,
    courseTitle: course.title,
    subjectName: subjectName,
    certificateId,
    issueDate: new Date(),
    verificationCode,
  });

  // Create certificate record
  const certificate = await Certificate.create({
    student: req.user._id,
    course: req.params.courseId,
    certificateId,
    verificationCode,
    pdfUrl: pdfResult.url,
    customName: customName !== req.user.name ? customName : '',
  });

  res.status(201).json({
    success: true,
    data: certificate,
  });
});

/**
 * @desc    Get student's certificates
 * @route   GET /api/certificates
 * @access  Private/Student/Teacher/Admin
 */
export const getCertificates = asyncHandler(async (req, res) => {
  let query = {};
  
  // Admins can see all certificates
  if (req.user.role === 'admin') {
    query = {};
  } 
  // Teachers can see certificates for their courses
  else if (req.user.role === 'teacher') {
    // Get all courses taught by this teacher
    const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
    const courseIds = teacherCourses.map(c => c._id);
    query = { course: { $in: courseIds } };
  } 
  // Students see only their own certificates
  else {
    query = { student: req.user._id };
  }
  
  const { limit } = req.query;
  let queryBuilder = Certificate.find(query)
    .populate('course', 'title description')
    .populate('student', 'name email')
    .sort({ issueDate: -1 });

  if (limit) {
    queryBuilder = queryBuilder.limit(parseInt(limit));
  }

  const certificates = await queryBuilder;

  res.json({
    success: true,
    count: certificates.length,
    data: certificates,
  });
});

/**
 * @desc    Get single certificate
 * @route   GET /api/certificates/:id
 * @access  Private/Student/Teacher/Admin
 */
export const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('course', 'title description teacher')
    .populate('student', 'name email');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      error: 'Certificate not found',
    });
  }

  // Check authorization
  const isOwner = certificate.student._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  
  // Check if teacher owns the course
  let isCourseOwner = false;
  if (req.user.role === 'teacher' && certificate.course.teacher) {
    const teacherId = certificate.course.teacher._id 
      ? certificate.course.teacher._id.toString() 
      : certificate.course.teacher.toString();
    isCourseOwner = teacherId === req.user._id.toString();
  }

  // Allow access if user owns certificate, is admin, or is the course teacher
  if (!isOwner && !isAdmin && !isCourseOwner) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this certificate',
    });
  }

  res.json({
    success: true,
    data: certificate,
  });
});

/**
 * @desc    Verify certificate
 * @route   GET /api/certificates/verify/:verificationCode
 * @access  Public
 */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    verificationCode: req.params.verificationCode,
  })
    .populate('course', 'title')
    .populate('student', 'name email');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      error: 'Certificate not found or invalid verification code',
    });
  }

  res.json({
    success: true,
    data: {
      valid: true,
      certificate: {
        studentName: certificate.student.name,
        courseTitle: certificate.course.title,
        issueDate: certificate.issueDate,
        certificateId: certificate.certificateId,
      },
    },
  });
});

