import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema(
  {
    instagram: {
      type: String,
      default: '',
      trim: true,
    },
    facebook: {
      type: String,
      default: '',
      trim: true,
    },
    tiktok: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one social media document exists
socialMediaSchema.statics.getSocialMedia = async function () {
  let socialMedia = await this.findOne();
  if (!socialMedia) {
    socialMedia = await this.create({});
  }
  return socialMedia;
};

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);

export default SocialMedia;

