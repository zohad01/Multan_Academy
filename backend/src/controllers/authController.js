import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Normalize email (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email',
    });
  }

  // Enforce student-only self-registration; teacher/admin must be created by admin
  if (role && role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Only students can self-register. Please contact admin for teacher access.',
    });
  }

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: 'student',
  });

  if (user) {
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid user data',
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password',
    });
  }

  // Normalize email (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Check for user
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Account has been deactivated',
    });
  }

  // Check if password matches
  if (!user.password) {
    console.error('Password field is missing for user:', normalizedEmail);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Check if user is still active (in case they were blocked while logged in)
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. Please contact administrator.',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    bio: req.body.bio,
  };

  // Teacher specific fields
  if (req.user.role === 'teacher') {
    fieldsToUpdate.specialization = req.body.specialization;
    fieldsToUpdate.experience = req.body.experience;
  }

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      error: 'Password is incorrect',
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

