import asyncHandler from '../middleware/asyncHandler.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Submission from '../models/Submission.js';

/**
 * @desc    Get quizzes for a course
 * @route   GET /api/quizzes/course/:courseId
 * @access  Public
 */
export const getCourseQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ course: req.params.courseId, isActive: true })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: quizzes.length,
    data: quizzes,
  });
});

/**
 * @desc    Get single quiz
 * @route   GET /api/quizzes/:id
 * @access  Private/Student (if enrolled)
 */
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found',
    });
  }

  // Check if user is enrolled (if authenticated)
  if (req.user && req.user.role === 'student') {
    const course = await Course.findById(quiz.course._id);
    const isEnrolled = course.studentsEnrolled.includes(req.user._id);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this quiz',
      });
    }

    // Check if already submitted
    const submission = await Submission.findOne({
      student: req.user._id,
      quiz: quiz._id,
    });

    if (submission) {
      // Return quiz with answers for review
      return res.json({
        success: true,
        data: {
          ...quiz.toObject(),
          submission,
          isSubmitted: true,
        },
      });
    }
  }

  // For teachers/admins or students taking quiz, don't show correct answers
  const quizWithoutAnswers = quiz.toObject();
  quizWithoutAnswers.questions = quiz.questions.map((q) => ({
    question: q.question,
    options: q.options,
    points: q.points,
  }));

  res.json({
    success: true,
    data: {
      ...quizWithoutAnswers,
      isSubmitted: false,
    },
  });
});

/**
 * @desc    Create quiz
 * @route   POST /api/quizzes
 * @access  Private/Teacher
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Make sure user is course owner or admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to add quizzes to this course',
    });
  }

  // Check if teacher is blocked (if teacher is creating, not admin)
  if (req.user.role === 'teacher' && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. You cannot upload course content.',
    });
  }

  const quiz = await Quiz.create(req.body);

  res.status(201).json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Update quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private/Teacher
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found',
    });
  }

  // Make sure user is course owner or admin
  if (quiz.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this quiz',
    });
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedQuiz,
  });
});

/**
 * @desc    Delete quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private/Teacher
 */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found',
    });
  }

  // Make sure user is course owner or admin
  if (quiz.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this quiz',
    });
  }

  await quiz.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Submit quiz
 * @route   POST /api/quizzes/:id/submit
 * @access  Private/Student
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

  const quiz = await Quiz.findById(req.params.id).populate('course');

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: 'Quiz not found',
    });
  }

  // Check enrollment
  const course = await Course.findById(quiz.course._id);
  if (!course.studentsEnrolled.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course',
    });
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    student: req.user._id,
    quiz: quiz._id,
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      error: 'Quiz already submitted',
    });
  }

  // Grade the quiz
  let score = 0;
  const quizAnswers = quiz.questions.map((question, index) => {
    const answer = answers.find((a) => a.questionIndex === index);
    const selectedAnswer = answer ? answer.selectedAnswer : -1;
    const isCorrect = selectedAnswer === question.correctAnswer;
    const points = isCorrect ? question.points : 0;
    score += points;

    return {
      questionIndex: index,
      selectedAnswer,
      isCorrect,
      points,
    };
  });

  const percentage = (score / quiz.totalPoints) * 100;
  const passed = percentage >= quiz.passingScore;

  // Create submission
  const submission = await Submission.create({
    student: req.user._id,
    course: quiz.course._id,
    quiz: quiz._id,
    quizAnswers,
    quizScore: score,
    quizPercentage: percentage,
    quizPassed: passed,
  });

  res.status(201).json({
    success: true,
    data: submission,
  });
});

