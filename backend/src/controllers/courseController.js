import asyncHandler from '../middleware/asyncHandler.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Material from '../models/Material.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { logAdminActivity } from '../utils/activityLogger.js';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const { subject, teacher, level, search, page = 1, limit = 10 } = req.query;
  
  // Admin can see all courses (published and unpublished), others only see published and active
  const query = {};
  if (req.user && req.user.role === 'admin') {
    // Admin sees all courses (active and inactive)
    // Don't filter by isActive for admin view
  } else {
    // Non-admin users only see published, active, and approved courses
    query.isPublished = true;
    query.isActive = true;
  }

  if (subject) query.subject = subject;
  if (teacher) query.teacher = teacher;
  if (level) query.level = level;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(query)
    .populate('teacher', 'name email')
    .populate('subject', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Course.countDocuments(query);

  res.json({
    success: true,
    count: courses.length,
    total,
    data: courses,
  });
});

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name email bio specialization experience')
    .populate('subject', 'name description');

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Non-admin users cannot access inactive (deleted) courses
  if (!course.isActive && (!req.user || req.user.role !== 'admin')) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Get videos, materials, quizzes, and assignments
  const videos = await Video.find({ course: course._id, isActive: true }).sort({ order: 1 });
  const materials = await Material.find({ course: course._id, isActive: true }).sort({ order: 1 });
  const quizzes = await Quiz.find({ course: course._id, isActive: true }).sort({ createdAt: -1 });
  const assignments = await Assignment.find({ course: course._id, isActive: true }).sort({ dueDate: 1 });

  // Check if user is enrolled (if authenticated)
  let isEnrolled = false;
  let progress = null;
  let isOwner = false;
  let isAdmin = false;
  let canEdit = false;
  
  if (req.user) {
    // Check if user is admin
    isAdmin = req.user.role === 'admin';
    
    // Check if user is the course owner (teacher) or admin
    // Handle both populated and non-populated teacher field
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    canEdit = isOwner || isAdmin; // Admins can edit any course
    
    // Convert ObjectIds to strings for proper comparison
    isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    if (isEnrolled) {
      progress = await Progress.findOne({
        student: req.user._id,
        course: course._id,
      });
    }
  }

  // Filter video URLs - only show URLs for enrolled students, owners, admins, or preview videos
  const filteredVideos = videos.map((video) => {
    const videoObj = video.toObject();
    // Hide video URL if user is not enrolled, not owner, not admin, and video is not a preview
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      delete videoObj.videoUrl;
    }
    return videoObj;
  });

  res.json({
    success: true,
    data: {
      ...course.toObject(),
      videos: filteredVideos,
      materials,
      quizzes,
      assignments,
      isEnrolled,
      progress,
      isOwner,
      isAdmin,
      canEdit, // Admin can edit any course
    },
  });
});

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Private/Teacher/Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  // If admin, allow assigning a teacher, otherwise use current user as teacher
  let teacherId;
  let assignedTeacher = null;

  if (req.user.role !== 'admin') {
    teacherId = req.user._id;
    // Check if teacher is blocked
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been blocked. You cannot create courses.',
      });
    }
    req.body.teacher = teacherId;
    assignedTeacher = req.user;
  } else {
    // Admin must provide a teacher
    if (!req.body.teacher) {
      return res.status(400).json({
        success: false,
        error: 'Please assign a teacher to the course',
      });
    }
    teacherId = req.body.teacher;
    // Check if assigned teacher is active
    assignedTeacher = await User.findById(teacherId);
    if (!assignedTeacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
      });
    }
    if (!assignedTeacher.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot assign course to a blocked teacher',
      });
    }
  }

  // Set course to pending approval (unless admin is creating it)
  if (req.user.role !== 'admin') {
    req.body.requiresApproval = false; // Teachers can publish directly for now
  }

  const course = await Course.create(req.body);

  // Log admin activity if admin created the course
  if (req.user.role === 'admin') {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'created course',
      resourceType: 'course',
      resourceId: course._id,
      details: `Created course: ${course.title} and assigned to teacher: ${assignedTeacher?.name || 'Unknown'}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.status(201).json({
    success: true,
    data: course,
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Teacher
 */
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Make sure user is course owner or admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this course',
    });
  }

  // Check if teacher is blocked (if teacher is updating, not admin)
  if (req.user.role === 'teacher' && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. You cannot update courses.',
    });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Log admin activity if admin updated the course
  if (req.user && req.user.role === 'admin' && course.teacher.toString() !== req.user._id.toString()) {
    const changes = Object.keys(req.body).join(', ');
    await logAdminActivity({
      adminId: req.user._id,
      action: 'updated course',
      resourceType: 'course',
      resourceId: course._id,
      details: `Updated course: ${course.title}. Changed fields: ${changes}`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    data: course,
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Teacher
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Make sure user is course owner or admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this course',
    });
  }

  const courseInfo = {
    title: course.title,
    id: course._id,
    enrolledCount: course.studentsEnrolled?.length || 0,
  };

  // Set course as inactive instead of deleting (for immediate removal from student view)
  // This maintains data integrity while hiding it immediately
  course.isActive = false;
  course.isPublished = false; // Also unpublish to ensure it disappears
  await course.save();

  // Alternatively, if you want to actually delete:
  // await course.deleteOne();

  // Log admin activity if admin deleted the course
  if (req.user && req.user.role === 'admin' && courseInfo.id) {
    await logAdminActivity({
      adminId: req.user._id,
      action: 'deleted course',
      resourceType: 'course',
      resourceId: courseInfo.id,
      details: `Deleted course: ${courseInfo.title} (${courseInfo.enrolledCount} enrolled students)`,
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });
  }

  res.json({
    success: true,
    message: 'Course deleted successfully. Course has been removed from student view immediately.',
    data: {},
  });
});

/**
 * @desc    Get teacher's courses
 * @route   GET /api/courses/teacher/my-courses
 * @access  Private/Teacher
 */
export const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id })
    .populate('subject', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc    Get student's enrolled courses
 * @route   GET /api/courses/student/my-courses
 * @access  Private/Student/Admin
 */
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  let courses;
  
  // If admin, return all published courses for viewing/testing purposes
  if (req.user.role === 'admin') {
    courses = await Course.find({ isPublished: true, isActive: true })
      .populate('teacher', 'name email')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });
  } else {
    // For students, return only enrolled and active courses (deleted courses disappear immediately)
    courses = await Course.find({ 
      studentsEnrolled: req.user._id,
      isActive: true // Ensure deleted/inactive courses don't show up
    })
      .populate('teacher', 'name email')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });
  }

  // Get progress for each course (only for enrolled students, admins get 0%)
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      let progress = null;
      if (req.user.role !== 'admin') {
        progress = await Progress.findOne({
          student: req.user._id,
          course: course._id,
        });
      }
      return {
        ...course.toObject(),
        progress: progress || { completionPercentage: 0 },
      };
    })
  );

  res.json({
    success: true,
    count: coursesWithProgress.length,
    data: coursesWithProgress,
  });
});

/**
 * @desc    Enroll student in course (free enrollment - no payment required)
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Check if course requires payment
  if (course.price > 0) {
    return res.status(400).json({
      success: false,
      error: 'This course requires payment. Please complete payment to enroll.',
    });
  }

  // Check if already enrolled
  const isAlreadyEnrolled = course.studentsEnrolled.some(
    (studentId) => studentId.toString() === req.user._id.toString()
  );
  if (isAlreadyEnrolled) {
    return res.status(400).json({
      success: false,
      error: 'You are already enrolled in this course',
    });
  }

  // Enroll student in course
  course.studentsEnrolled.push(req.user._id);
  await course.save();

  // Add course to user's enrolled courses
  const user = await User.findById(req.user._id);
  if (!user.enrolledCourses.includes(course._id)) {
    user.enrolledCourses.push(course._id);
    await user.save();
  }

  // Create initial progress record
  await Progress.findOneAndUpdate(
    { student: req.user._id, course: course._id },
    {
      student: req.user._id,
      course: course._id,
      videosWatched: [],
      completionPercentage: 0,
      lastAccessed: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: {
      courseId: course._id,
      courseTitle: course.title,
    },
  });
});

/**
 * @desc    Get enrolled students for a course
 * @route   GET /api/courses/:id/students
 * @access  Private/Teacher/Admin
 */
export const getCourseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Check if user is course owner (teacher), admin, or has access
  // Handle both populated and non-populated teacher field
  const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
  const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
  const isAdmin = req.user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view enrolled students',
    });
  }

  // Get enrolled students with their details and progress
  const enrolledStudents = await User.find({
    _id: { $in: course.studentsEnrolled },
  })
    .select('name email role createdAt')
    .sort({ createdAt: -1 });

  // Get progress for each student
  const studentsWithProgress = await Promise.all(
    enrolledStudents.map(async (student) => {
      const progress = await Progress.findOne({
        student: student._id,
        course: course._id,
      });

      // Get enrollment date (approximate from when they were added to course)
      // Since we don't track exact enrollment date, we'll use user creation date or progress creation
      let enrollmentDate = student.createdAt;
      if (progress && progress.createdAt) {
        enrollmentDate = progress.createdAt;
      }

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        enrollmentDate,
        progress: progress
          ? {
              completionPercentage: progress.completionPercentage || 0,
              lastAccessed: progress.lastAccessed,
              videosWatched: progress.videosWatched?.length || 0,
            }
          : {
              completionPercentage: 0,
              lastAccessed: null,
              videosWatched: 0,
            },
      };
    })
  );

  res.json({
    success: true,
    count: studentsWithProgress.length,
    data: studentsWithProgress,
  });
});

/**
 * @desc    Approve course (Admin only)
 * @route   PUT /api/admin/courses/:id/approve
 * @access  Private/Admin
 */
export const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Approve and publish course
  course.isPublished = true;
  course.isActive = true;
  course.approvedBy = req.user._id;
  course.approvedAt = new Date();
  await course.save();

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'approved course',
    resourceType: 'course',
    resourceId: course._id,
    details: `Approved and published course: ${course.title}`,
    ipAddress: req.ip || req.connection.remoteAddress || '',
  });

  res.json({
    success: true,
    message: 'Course approved and published successfully',
    data: course,
  });
});

/**
 * @desc    Reject course (Admin only)
 * @route   PUT /api/admin/courses/:id/reject
 * @access  Private/Admin
 */
export const rejectCourse = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Unpublish and deactivate course
  course.isPublished = false;
  course.isActive = false;
  await course.save();

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'rejected course',
    resourceType: 'course',
    resourceId: course._id,
    details: `Rejected course: ${course.title}. Reason: ${reason || 'Not provided'}`,
    ipAddress: req.ip || req.connection.remoteAddress || '',
  });

  res.json({
    success: true,
    message: 'Course rejected and unpublished successfully',
    data: course,
  });
});

