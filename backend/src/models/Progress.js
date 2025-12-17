import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    videosWatched: [
      {
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video',
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number, // percentage watched (0-100)
          default: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
progressSchema.index({ student: 1, course: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;

