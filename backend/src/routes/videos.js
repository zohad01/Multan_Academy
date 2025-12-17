import express from 'express';
import {
  getCourseVideos,
  getVideo,
  getVideoStreamToken,
  createVideo,
  updateVideo,
  deleteVideo,
  updateVideoProgress,
} from '../controllers/videoController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/course/:courseId', getCourseVideos);
router.get('/:id', protect, getVideo);
router.get('/:id/stream-token', protect, getVideoStreamToken);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('video'), createVideo);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('video'), updateVideo);
router.put('/:id/progress', protect, authorize('student'), updateVideoProgress);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteVideo);

export default router;

