import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema(
  {
    sessionTimeoutMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 480, // 8 hours max
    },
    inactivityTimeoutMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 120, // 2 hours max
    },
    maxSessionDurationHours: {
      type: Number,
      default: 8,
      min: 1,
      max: 24,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one config document exists
adminConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const AdminConfig = mongoose.model('AdminConfig', adminConfigSchema);

export default AdminConfig;

