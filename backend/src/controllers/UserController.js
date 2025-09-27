import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';









/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  // The 'auth' middleware should add the user ID to req.user._id or a similar property.
  // We'll assume it's req.user and it contains the user's data from the database.
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update user fields, using existing values as a fallback
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.streetAddress = req.body.streetAddress || user.streetAddress;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;
    user.zipCode = req.body.zipCode || user.zipCode;

    // Only update email if it's different and not already in use
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already in use');
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        streetAddress: updatedUser.streetAddress,
        city: updatedUser.city,
        state: updatedUser.state,
        zipCode: updatedUser.zipCode,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getProfile, updateProfile };