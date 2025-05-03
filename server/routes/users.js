const express = require('express');
const router = express.Router();
const { User } = require('../models').models;
const auth = require('../middleware/auth');

// GET current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
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
router.put('/me', auth, async (req, res) => {
  const { name, phone, location, about, website, company, position } = req.body;
  
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    user.name = name || user.name;
    
    // Update profile fields
    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.about = about || user.about;
    user.website = website || user.website;
    
    // Role-specific fields
    if (user.role === 'candidate') {
      user.position = position || user.position;
    }
    if (user.role === 'recruiter') {
      user.company = company || user.company;
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