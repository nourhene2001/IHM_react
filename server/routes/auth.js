const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models').models;

console.log('User model:', User); // Debug: Log User model

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = await User.create({ name, email, password, role }); // beforeSave hook hashes password
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name, email, role } });
  } catch (err) {
    console.error('Error registering user:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    console.log('User instance:', user); // Debug: Log user instance
    console.log('User prototype:', Object.getPrototypeOf(user)); // Debug: Log prototype
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isBanned) {
      return res.status(403).json({ message: 'Access denied: You are banned' });
    }

    if (!user.comparePassword) {
      throw new Error('comparePassword method is missing on user instance');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error('Error logging in:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;