import asyncHandler from '../middleware/asyncHandler.js';
import SocialMedia from '../models/SocialMedia.js';

/**
 * @desc    Get social media links
 * @route   GET /api/social-media
 * @access  Public
 */
export const getSocialMedia = asyncHandler(async (req, res) => {
  const socialMedia = await SocialMedia.getSocialMedia();

  res.json({
    success: true,
    data: socialMedia,
  });
});

/**
 * @desc    Update social media links
 * @route   PUT /api/social-media
 * @access  Private/Admin
 */
export const updateSocialMedia = asyncHandler(async (req, res) => {
  let socialMedia = await SocialMedia.findOne();

  if (!socialMedia) {
    socialMedia = await SocialMedia.create(req.body);
  } else {
    socialMedia = await SocialMedia.findByIdAndUpdate(socialMedia._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.json({
    success: true,
    data: socialMedia,
  });
});

