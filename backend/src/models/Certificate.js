import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
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
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    customName: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
certificateSchema.index({ student: 1, course: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;

