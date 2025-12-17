import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: Number, // index of correct option
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    questions: [questionSchema],
    totalPoints: {
      type: Number,
      default: 0,
    },
    passingScore: {
      type: Number, // percentage
      default: 60,
    },
    timeLimit: {
      type: Number, // in minutes, 0 means no limit
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
quizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce(
      (sum, question) => sum + (question.points || 1),
      0
    );
  }
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;

