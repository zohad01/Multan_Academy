import express from 'express';
import {
  generateCertificate,
  getCertificates,
  getCertificate,
  verifyCertificate,
} from '../controllers/certificateController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

router.get('/verify/:verificationCode', verifyCertificate);
router.get('/', protect, authorize('student', 'teacher', 'admin'), getCertificates);
router.get('/:id', protect, authorize('student', 'teacher', 'admin'), getCertificate);
router.post('/generate/:courseId', protect, authorize('student'), generateCertificate);

export default router;

