import express from 'express';
import {
  getGlobalIntroVideo,
  getCoursePreviewVideo,
  getIntroVideos,
  getIntroVideo,
  createIntroVideo,
  updateIntroVideo,
  deleteIntroVideo,
} from '../controllers/introVideoController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Public routes
router.get('/global', getGlobalIntroVideo);
router.get('/preview/:courseId', getCoursePreviewVideo);

// Protected routes
router.get('/', protect, authorize('admin', 'teacher'), getIntroVideos);
router.get('/:id', protect, authorize('admin', 'teacher'), getIntroVideo);
router.post('/', protect, authorize('admin', 'teacher'), createIntroVideo);
router.put('/:id', protect, authorize('admin', 'teacher'), updateIntroVideo);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteIntroVideo);

export default router;

