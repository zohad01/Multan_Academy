import express from 'express';
import {
  getStats,
  getActivityLogs,
  createActivityLog,
} from '../controllers/adminController.js';
import {
  getAdminConfig,
  updateAdminConfig,
} from '../controllers/adminConfigController.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getAllPayments,
  verifyPayment,
  rejectPayment,
} from '../controllers/paymentController.js';
import {
  approveCourse,
  rejectCourse,
} from '../controllers/courseController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/activity-logs', getActivityLogs);
router.post('/activity-logs', createActivityLog);

// Admin config routes
router.get('/config', getAdminConfig);
router.put('/config', updateAdminConfig);

// Category management routes (admin only)
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Payment management routes (admin only)
router.get('/payments', getAllPayments);
router.put('/payments/:id/verify', verifyPayment);
router.put('/payments/:id/reject', rejectPayment);

// Course approval routes (admin only)
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);

export default router;

