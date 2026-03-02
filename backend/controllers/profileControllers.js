import User from "../models/User.js";

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      id:          user._id,
      name:        user.name,
      email:       user.email,
      age:         user.age,
      dateOfBirth: user.dateOfBirth,
      city:        user.city,
      country:     user.country,
      nationality: user.nationality,
      phone:       user.phone,
      isVerified:  user.isVerified, // ← this was missing
      createdAt:   user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    user.name        = req.body.name        || user.name;
    user.age         = req.body.age         || user.age;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.city        = req.body.city        || user.city;
    user.country     = req.body.country     || user.country;
    user.nationality = req.body.nationality || user.nationality;
    user.phone       = req.body.phone       || user.phone;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id:          updatedUser._id,
        name:        updatedUser.name,
        email:       updatedUser.email,
        age:         updatedUser.age,
        dateOfBirth: updatedUser.dateOfBirth,
        city:        updatedUser.city,
        country:     updatedUser.country,
        nationality: updatedUser.nationality,
        phone:       updatedUser.phone,
        isVerified:  updatedUser.isVerified, // ← this was missing too
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};