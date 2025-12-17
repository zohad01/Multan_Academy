import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a teacher'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Please add a scheduled date and time'],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    meetingUrl: {
      type: String,
      required: [true, 'Please add a meeting URL'],
    },
    meetingId: {
      type: String,
      default: '',
    },
    meetingPassword: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    provider: {
      type: String,
      enum: ['zoom', 'meet', 'webrtc'],
      default: 'zoom',
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
liveClassSchema.index({ course: 1, scheduledAt: 1 });
liveClassSchema.index({ teacher: 1, scheduledAt: 1 });
liveClassSchema.index({ status: 1, scheduledAt: 1 });

const LiveClass = mongoose.model('LiveClass', liveClassSchema);

export default LiveClass;

