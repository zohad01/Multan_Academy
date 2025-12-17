import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add an admin'],
    },
    action: {
      type: String,
      required: [true, 'Please add an action'],
    },
    resourceType: {
      type: String,
      enum: ['user', 'teacher', 'course', 'subject', 'category', 'other'],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
activityLogSchema.index({ admin: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

