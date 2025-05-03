const express = require('express');
const router = express.Router();
const { User } = require('../models').models;
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
});

// GET current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE user profile
router.put('/me', auth, upload.single('avatar'), async (req, res) => {
  const {
    name,
    phone,
    location,
    about,
    website,
    company,
    position,
    skills,
    experiences,
    education,
  } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
    }
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    if (website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(website)) {
      return res.status(400).json({ message: 'Invalid website URL' });
    }

    // Parse JSON fields
    let parsedSkills, parsedExperiences, parsedEducation;
    try {
      parsedSkills = skills ? JSON.parse(skills) : user.skills;
      parsedExperiences = experiences ? JSON.parse(experiences) : user.experiences;
      parsedEducation = education ? JSON.parse(education) : user.education;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JSON format for skills, experiences, or education' });
    }

    // Update fields
    user.name = name.trim();
    user.phone = phone ? phone.trim() : user.phone;
    user.location = location ? location.trim() : user.location;
    user.about = about ? about.trim() : user.about;
    user.website = website ? website.trim() : user.website;
    user.skills = Array.isArray(parsedSkills) ? parsedSkills : user.skills;
    user.experiences = Array.isArray(parsedExperiences) ? parsedExperiences : user.experiences;
    user.education = Array.isArray(parsedEducation) ? parsedEducation : user.education;

    // Role-specific fields
    if (user.role === 'candidate') {
      user.position = position ? position.trim() : user.position;
    }
    if (user.role === 'recruiter') {
      user.company = company ? company.trim() : user.company;
    }

    // Handle avatar
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = user.get({ plain: true });
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;