import express from 'express';
import {
  getCourseQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

export default router;

