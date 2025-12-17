import express from 'express';
import {
  createLiveClass,
  getCourseLiveClasses,
  getLiveClass,
  updateLiveClass,
  deleteLiveClass,
  joinLiveClass,
} from '../controllers/liveClassController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route (with optional auth)
router.get('/course/:courseId', optionalAuth, getCourseLiveClasses);

// Protected routes
router.get('/:id', protect, getLiveClass);
router.post('/', protect, authorize('teacher', 'admin'), createLiveClass);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLiveClass);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLiveClass);
router.post('/:id/join', protect, authorize('student', 'admin'), joinLiveClass);

export default router;

