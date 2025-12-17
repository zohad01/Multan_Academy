import asyncHandler from './asyncHandler.js';

// In-memory store for video session tokens (can be replaced with Redis in production)
const videoTokens = new Map();

/**
 * Generate a video stream token
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID
 * @returns {string} Token
 */
export const generateVideoToken = (videoId, userId) => {
  const token = `${videoId}-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry
  
  videoTokens.set(token, {
    videoId,
    userId,
    expiry,
  });

  // Clean up expired tokens periodically
  if (videoTokens.size > 1000) {
    const now = Date.now();
    for (const [key, value] of videoTokens.entries()) {
      if (value.expiry < now) {
        videoTokens.delete(key);
      }
    }
  }

  return token;
};

/**
 * Validate video stream token
 * @param {string} token - Token to validate
 * @returns {Object|null} Token data or null if invalid
 */
export const validateVideoToken = (token) => {
  const tokenData = videoTokens.get(token);
  
  if (!tokenData) {
    return null;
  }

  // Check if token has expired
  if (tokenData.expiry < Date.now()) {
    videoTokens.delete(token);
    return null;
  }

  return tokenData;
};

/**
 * Middleware to validate video access token
 */
export const validateVideoAccess = asyncHandler(async (req, res, next) => {
  const token = req.headers['x-video-token'] || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Video access token required',
    });
  }

  const tokenData = validateVideoToken(token);

  if (!tokenData) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired video access token',
    });
  }

  // Attach token data to request
  req.videoToken = tokenData;
  next();
});

/**
 * Clean up expired tokens (can be called periodically)
 */
export const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [key, value] of videoTokens.entries()) {
    if (value.expiry < now) {
      videoTokens.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

