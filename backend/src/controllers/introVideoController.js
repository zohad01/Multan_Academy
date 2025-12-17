import asyncHandler from '../middleware/asyncHandler.js';
import IntroVideo from '../models/IntroVideo.js';
import Course from '../models/Course.js';

/**
 * @desc    Get global intro video
 * @route   GET /api/intro-videos/global
 * @access  Public
 */
export const getGlobalIntroVideo = asyncHandler(async (req, res) => {
  const introVideo = await IntroVideo.findOne({
    type: 'global',
    isActive: true,
  }).sort({ order: 1 });

  if (!introVideo) {
    return res.json({
      success: true,
      data: null,
    });
  }

  res.json({
    success: true,
    data: introVideo,
  });
});

/**
 * @desc    Get course preview video
 * @route   GET /api/intro-videos/preview/:courseId
 * @access  Public
 */
export const getCoursePreviewVideo = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  const previewVideo = await IntroVideo.findOne({
    type: 'course-preview',
    course: req.params.courseId,
    isActive: true,
  }).sort({ order: 1 });

  if (!previewVideo) {
    return res.json({
      success: true,
      data: null,
    });
  }

  res.json({
    success: true,
    data: previewVideo,
  });
});

/**
 * @desc    Get all intro videos (Admin/Teacher)
 * @route   GET /api/intro-videos
 * @access  Private/Admin/Teacher
 */
export const getIntroVideos = asyncHandler(async (req, res) => {
  const { type, courseId } = req.query;
  const query = {};

  if (type) {
    query.type = type;
  }

  if (courseId) {
    query.course = courseId;
  }

  const introVideos = await IntroVideo.find(query).sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: introVideos.length,
    data: introVideos,
  });
});

/**
 * @desc    Get single intro video
 * @route   GET /api/intro-videos/:id
 * @access  Private/Admin/Teacher
 */
export const getIntroVideo = asyncHandler(async (req, res) => {
  const introVideo = await IntroVideo.findById(req.params.id);

  if (!introVideo) {
    return res.status(404).json({
      success: false,
      error: 'Intro video not found',
    });
  }

  res.json({
    success: true,
    data: introVideo,
  });
});

/**
 * @desc    Create intro video
 * @route   POST /api/intro-videos
 * @access  Private/Admin/Teacher
 */
export const createIntroVideo = asyncHandler(async (req, res) => {
  // Validate course if course-preview type
  if (req.body.type === 'course-preview' && req.body.course) {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // If teacher, verify they own the course
    if (req.user.role === 'teacher') {
      const teacherId = course.teacher._id
        ? course.teacher._id.toString()
        : course.teacher.toString();
      if (teacherId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to create preview for this course',
        });
      }
    }
  }

  // For global type, ensure course is not set
  if (req.body.type === 'global') {
    req.body.course = null;
  }

  const introVideo = await IntroVideo.create(req.body);

  res.status(201).json({
    success: true,
    data: introVideo,
  });
});

/**
 * @desc    Update intro video
 * @route   PUT /api/intro-videos/:id
 * @access  Private/Admin/Teacher
 */
export const updateIntroVideo = asyncHandler(async (req, res) => {
  const introVideo = await IntroVideo.findById(req.params.id);

  if (!introVideo) {
    return res.status(404).json({
      success: false,
      error: 'Intro video not found',
    });
  }

  // If teacher, verify they own the course (if course-preview)
  if (req.user.role === 'teacher' && introVideo.type === 'course-preview' && introVideo.course) {
    const course = await Course.findById(introVideo.course);
    if (course) {
      const teacherId = course.teacher._id
        ? course.teacher._id.toString()
        : course.teacher.toString();
      if (teacherId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this preview video',
        });
      }
    }
  }

  // For global type, ensure course is not set
  if (req.body.type === 'global') {
    req.body.course = null;
  }

  const updatedIntroVideo = await IntroVideo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedIntroVideo,
  });
});

/**
 * @desc    Delete intro video
 * @route   DELETE /api/intro-videos/:id
 * @access  Private/Admin/Teacher
 */
export const deleteIntroVideo = asyncHandler(async (req, res) => {
  const introVideo = await IntroVideo.findById(req.params.id);

  if (!introVideo) {
    return res.status(404).json({
      success: false,
      error: 'Intro video not found',
    });
  }

  // If teacher, verify they own the course (if course-preview)
  if (req.user.role === 'teacher' && introVideo.type === 'course-preview' && introVideo.course) {
    const course = await Course.findById(introVideo.course);
    if (course) {
      const teacherId = course.teacher._id
        ? course.teacher._id.toString()
        : course.teacher.toString();
      if (teacherId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this preview video',
        });
      }
    }
  }

  await introVideo.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

