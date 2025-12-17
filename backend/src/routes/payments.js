import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  submitManualPayment,
} from '../controllers/paymentController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import upload, { uploadReceipt } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/', createPayment);
router.post('/manual', uploadReceipt.single('receipt'), submitManualPayment);

export default router;

