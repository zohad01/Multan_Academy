import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a student'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    // For quiz submissions
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    quizAnswers: [
      {
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
        points: Number,
      },
    ],
    quizScore: {
      type: Number,
      default: 0,
    },
    quizPercentage: {
      type: Number,
      default: 0,
    },
    quizPassed: {
      type: Boolean,
      default: false,
    },
    // For assignment submissions
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    assignmentAnswer: {
      type: String,
      default: '',
    },
    assignmentFiles: [
      {
        fileUrl: String,
        fileName: String,
      },
    ],
    assignmentScore: {
      type: Number,
      default: 0,
    },
    assignmentFeedback: {
      type: String,
      default: '',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
// Use partial indexes to ensure uniqueness only when the field exists
submissionSchema.index(
  { student: 1, quiz: 1 },
  { unique: true, partialFilterExpression: { quiz: { $exists: true, $ne: null } } }
);
submissionSchema.index(
  { student: 1, assignment: 1 },
  { unique: true, partialFilterExpression: { assignment: { $exists: true, $ne: null } } }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

