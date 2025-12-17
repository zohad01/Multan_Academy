import asyncHandler from '../middleware/asyncHandler.js';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Submission from '../models/Submission.js';

/**
 * @desc    Get assignments for a course
 * @route   GET /api/assignments/course/:courseId
 * @access  Public
 */
export const getCourseAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ course: req.params.courseId, isActive: true })
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    count: assignments.length,
    data: assignments,
  });
});

/**
 * @desc    Get single assignment
 * @route   GET /api/assignments/:id
 * @access  Private/Student (if enrolled)
 */
export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: 'Assignment not found',
    });
  }

  // Check if user is enrolled (if authenticated)
  if (req.user && req.user.role === 'student') {
    const course = await Course.findById(assignment.course._id);
    const isEnrolled = course.studentsEnrolled.includes(req.user._id);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this assignment',
      });
    }

    // Check if already submitted
    const submission = await Submission.findOne({
      student: req.user._id,
      assignment: assignment._id,
    });

    if (submission) {
      return res.json({
        success: true,
        data: {
          ...assignment.toObject(),
          submission,
          isSubmitted: true,
        },
      });
    }
  }

  res.json({
    success: true,
    data: {
      ...assignment.toObject(),
      isSubmitted: false,
    },
  });
});

/**
 * @desc    Create assignment
 * @route   POST /api/assignments
 * @access  Private/Teacher
 */
export const createAssignment = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);

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
      error: 'Not authorized to add assignments to this course',
    });
  }

  // Check if teacher is blocked (if teacher is creating, not admin)
  if (req.user.role === 'teacher' && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. You cannot upload course content.',
    });
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    success: true,
    data: assignment,
  });
});

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private/Teacher
 */
export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: 'Assignment not found',
    });
  }

  // Make sure user is course owner or admin
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this assignment',
    });
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedAssignment,
  });
});

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private/Teacher
 */
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: 'Assignment not found',
    });
  }

  // Make sure user is course owner or admin
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this assignment',
    });
  }

  await assignment.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private/Student
 */
export const submitAssignment = asyncHandler(async (req, res) => {
  const { answer, files } = req.body;

  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: 'Assignment not found',
    });
  }

  // Check enrollment
  const course = await Course.findById(assignment.course._id);
  if (!course.studentsEnrolled.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course',
    });
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    student: req.user._id,
    assignment: assignment._id,
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      error: 'Assignment already submitted',
    });
  }

  // Create submission
  const submission = await Submission.create({
    student: req.user._id,
    course: assignment.course._id,
    assignment: assignment._id,
    assignmentAnswer: answer || '',
    assignmentFiles: files || [],
  });

  res.status(201).json({
    success: true,
    data: submission,
  });
});

/**
 * @desc    Grade assignment
 * @route   PUT /api/assignments/:id/grade
 * @access  Private/Teacher
 */
export const gradeAssignment = asyncHandler(async (req, res) => {
  const { submissionId, score, feedback } = req.body;

  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      error: 'Assignment not found',
    });
  }

  // Make sure user is course owner or admin
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to grade this assignment',
    });
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    return res.status(404).json({
      success: false,
      error: 'Submission not found',
    });
  }

  submission.assignmentScore = score;
  submission.assignmentFeedback = feedback || '';
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();

  await submission.save();

  res.json({
    success: true,
    data: submission,
  });
});

