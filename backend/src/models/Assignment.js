import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an assignment description'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    instructions: {
      type: String,
      default: '',
    },
    attachments: [
      {
        fileUrl: String,
        fileName: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

