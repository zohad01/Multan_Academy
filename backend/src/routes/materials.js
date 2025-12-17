import express from 'express';
import {
  getCourseMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
} from '../controllers/materialController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/course/:courseId', getCourseMaterials);
router.get('/:id/download', protect, downloadMaterial);
router.get('/:id', protect, getMaterial);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('material'), createMaterial);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('material'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

export default router;

