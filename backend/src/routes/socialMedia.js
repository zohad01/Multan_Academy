import express from 'express';
import {
  getSocialMedia,
  updateSocialMedia,
} from '../controllers/socialMediaController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Public route
router.get('/', getSocialMedia);

// Protected admin route
router.put('/', protect, authorize('admin'), updateSocialMedia);

export default router;

