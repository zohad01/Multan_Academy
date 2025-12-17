import asyncHandler from '../middleware/asyncHandler.js';
import Material from '../models/Material.js';
import Course from '../models/Course.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get materials for a course
 * @route   GET /api/materials/course/:courseId
 * @access  Public
 */
export const getCourseMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find({ course: req.params.courseId, isActive: true })
    .sort({ order: 1 });

  res.json({
    success: true,
    count: materials.length,
    data: materials,
  });
});

/**
 * @desc    Get single material
 * @route   GET /api/materials/:id
 * @access  Private/Student (if enrolled)
 */
export const getMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('course');

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found',
    });
  }

  // Check if user is enrolled or is the course owner (if authenticated)
  if (req.user) {
    const course = await Course.findById(material.course._id);
    
    // Handle both populated and non-populated teacher field
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    
    // For students, check enrollment
    if (req.user.role === 'student') {
      const isEnrolled = course.studentsEnrolled.includes(req.user._id);

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          error: 'You must be enrolled in this course to access this material',
        });
      }
    }
    // Teachers (owners) and admins can always access materials
  }

  res.json({
    success: true,
    data: material,
  });
});

/**
 * @desc    Download/Serve material file
 * @route   GET /api/materials/:id/download
 * @access  Private/Student (if enrolled) or Teacher/Admin
 */
export const downloadMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('course');

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found',
    });
  }

  // Check authorization
  if (req.user) {
    const course = await Course.findById(material.course._id);
    
    // Handle both populated and non-populated teacher field
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    
    // For students, check enrollment
    if (req.user.role === 'student') {
      const isEnrolled = course.studentsEnrolled.includes(req.user._id);

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          error: 'You must be enrolled in this course to access this material',
        });
      }
    }
    // Teachers (owners) and admins can always access materials
  } else {
    return res.status(401).json({
      success: false,
      error: 'Please login to access this material',
    });
  }

  // If it's an external URL, return it for frontend to handle
  if (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://')) {
    // For external URLs, return JSON with the URL so frontend can redirect
    return res.json({
      success: true,
      redirect: true,
      url: material.fileUrl,
    });
  }

  // Handle local file
  // Remove leading slash if present
  const filePath = material.fileUrl.startsWith('/') 
    ? material.fileUrl.substring(1) 
    : material.fileUrl;
  
  // Resolve path relative to project root (backend directory)
  const fullPath = path.join(__dirname, '../../', filePath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    // If file doesn't exist, try to serve it via static middleware redirect
    // This handles cases where the file might be in a different location
    return res.status(404).json({
      success: false,
      error: 'Material file not found. The file may have been deleted or moved.',
      filePath: material.fileUrl,
    });
  }

  // Set appropriate headers for file download/viewing
  const ext = path.extname(fullPath).toLowerCase();
  const contentTypeMap = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
  };
  
  const contentType = contentTypeMap[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  
  // Send the file
  res.sendFile(path.resolve(fullPath));
});

/**
 * @desc    Create material
 * @route   POST /api/materials
 * @access  Private/Teacher
 */
export const createMaterial = asyncHandler(async (req, res) => {
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
      error: 'Not authorized to add materials to this course',
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
    req.body.fileUrl = `/uploads/materials/${req.file.filename}`;
  }

  const material = await Material.create(req.body);

  res.status(201).json({
    success: true,
    data: material,
  });
});

/**
 * @desc    Update material
 * @route   PUT /api/materials/:id
 * @access  Private/Teacher
 */
export const updateMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('course');

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found',
    });
  }

  // Make sure user is course owner or admin
  if (material.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this material',
    });
  }

  // Handle file upload
  if (req.file) {
    req.body.fileUrl = `/uploads/materials/${req.file.filename}`;
  }

  const updatedMaterial = await Material.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedMaterial,
  });
});

/**
 * @desc    Delete material
 * @route   DELETE /api/materials/:id
 * @access  Private/Teacher
 */
export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('course');

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Material not found',
    });
  }

  // Make sure user is course owner or admin
  if (material.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this material',
    });
  }

  await material.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

