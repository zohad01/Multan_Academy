import asyncHandler from '../middleware/asyncHandler.js';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import { generateVideoToken } from '../middleware/videoProtection.js';

/**
 * @desc    Get videos for a course
 * @route   GET /api/videos/course/:courseId
 * @access  Public (but video URLs filtered based on enrollment)
 */
export const getCourseVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ course: req.params.courseId, isActive: true })
    .sort({ order: 1 });

  // Check enrollment status to filter video URLs
  let isEnrolled = false;
  let isOwner = false;
  let isAdmin = false;

  if (req.user) {
    const course = await Course.findById(req.params.courseId);
    if (course) {
      isEnrolled = course.studentsEnrolled.some(
        (studentId) => studentId.toString() === req.user._id.toString()
      );
      const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
      isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
      isAdmin = req.user.role === 'admin';
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
    count: filteredVideos.length,
    data: filteredVideos,
  });
});

/**
 * @desc    Get single video
 * @route   GET /api/videos/:id
 * @access  Private/Student (if enrolled)
 */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user is enrolled or is the course owner (if authenticated)
  if (req.user) {
    const course = await Course.findById(video.course._id);
    const isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    // Handle both populated and non-populated teacher field
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    // Admins can access all videos, owners can access their course videos, enrolled students can access videos
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this video',
      });
    }
  } else if (!video.isPreview) {
    return res.status(401).json({
      success: false,
      error: 'Please login and enroll to access this video',
    });
  }

  // Generate stream token for video access
  let streamToken = null;
  if (req.user && !video.isPreview) {
    streamToken = generateVideoToken(video._id.toString(), req.user._id.toString());
  }

  const videoData = video.toObject();
  if (streamToken) {
    videoData.streamToken = streamToken;
  }

  res.json({
    success: true,
    data: videoData,
  });
});

/**
 * @desc    Get video stream token
 * @route   GET /api/videos/:id/stream-token
 * @access  Private/Student (if enrolled)
 */
export const getVideoStreamToken = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user is enrolled or is the course owner (if authenticated)
  if (req.user) {
    const course = await Course.findById(video.course._id);
    const isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    // Admins can access all videos, owners can access their course videos, enrolled students can access videos
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this video',
      });
    }

    // Generate stream token
    const streamToken = generateVideoToken(video._id.toString(), req.user._id.toString());

    res.json({
      success: true,
      data: {
        streamToken,
        expiresIn: 3600, // 1 hour in seconds
      },
    });
  } else if (!video.isPreview) {
    return res.status(401).json({
      success: false,
      error: 'Please login and enroll to access this video',
    });
  } else {
    // Preview videos don't need tokens
    res.json({
      success: true,
      data: {
        streamToken: null,
        expiresIn: 0,
      },
    });
  }
});

/**
 * @desc    Create video
 * @route   POST /api/videos
 * @access  Private/Teacher
 */
export const createVideo = asyncHandler(async (req, res) => {
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
      error: 'Not authorized to add videos to this course',
    });
  }

  // Check if teacher is blocked (if teacher is creating, not admin)
  if (req.user.role === 'teacher' && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. You cannot upload course content.',
    });
  }

  // Handle file upload
  if (req.file) {
    req.body.videoUrl = `/uploads/videos/${req.file.filename}`;
  }

  const video = await Video.create(req.body);

  res.status(201).json({
    success: true,
    data: video,
  });
});

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private/Teacher
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Make sure user is course owner or admin
  if (video.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this video',
    });
  }

  // Handle file upload
  if (req.file) {
    req.body.videoUrl = `/uploads/videos/${req.file.filename}`;
  }

  const updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedVideo,
  });
});

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private/Teacher
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Make sure user is course owner or admin
  if (video.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this video',
    });
  }

  await video.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Update video progress
 * @route   PUT /api/videos/:id/progress
 * @access  Private/Student
 */
export const updateVideoProgress = asyncHandler(async (req, res) => {
  const { progress, completed } = req.body;
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check enrollment - teachers and admins don't need to track progress
  const course = await Course.findById(video.course);
  const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
  const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
  const isAdmin = req.user.role === 'admin';
  
  // If user is teacher (owner) or admin, skip progress tracking
  if (isOwner || isAdmin) {
    return res.json({
      success: true,
      message: 'Progress tracking skipped for course owner/admin',
      data: {},
    });
  }

  // For students, check enrollment
  if (!course.studentsEnrolled.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course',
    });
  }

  // Update or create progress
  let courseProgress = await Progress.findOne({
    student: req.user._id,
    course: video.course,
  });

  if (!courseProgress) {
    courseProgress = await Progress.create({
      student: req.user._id,
      course: video.course,
      videosWatched: [],
    });
  }

  // Update video progress
  const videoIndex = courseProgress.videosWatched.findIndex(
    (v) => v.video.toString() === video._id.toString()
  );

  if (videoIndex >= 0) {
    courseProgress.videosWatched[videoIndex].progress = progress || 0;
    courseProgress.videosWatched[videoIndex].completed = completed || false;
    if (completed) {
      courseProgress.videosWatched[videoIndex].watchedAt = new Date();
    }
  } else {
    courseProgress.videosWatched.push({
      video: video._id,
      progress: progress || 0,
      completed: completed || false,
      watchedAt: completed ? new Date() : null,
    });
  }

  // Calculate completion percentage
  const totalVideos = await Video.countDocuments({ course: video.course, isActive: true });
  const completedVideos = courseProgress.videosWatched.filter((v) => v.completed).length;
  courseProgress.completionPercentage = Math.round((completedVideos / totalVideos) * 100);
  courseProgress.lastAccessed = new Date();

  await courseProgress.save();

  res.json({
    success: true,
    data: courseProgress,
  });
});

