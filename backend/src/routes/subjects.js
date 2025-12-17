import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', protect, authorize('admin'), createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router;

