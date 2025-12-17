import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a material title'],
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
    fileUrl: {
      type: String,
      required: [true, 'Please add a file URL'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'txt', 'other'],
      default: 'pdf',
    },
    order: {
      type: Number,
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

const Material = mongoose.model('Material', materialSchema);

export default Material;

