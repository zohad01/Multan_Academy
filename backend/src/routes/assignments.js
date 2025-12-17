import express from 'express';
import {
  getCourseAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
} from '../controllers/assignmentController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/course/:courseId', getCourseAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.array('files'), submitAssignment);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

export default router;

