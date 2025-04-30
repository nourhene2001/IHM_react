const express = require('express');
const router = express.Router();
const { Job, User } = require('../models').models;
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// GET /api/admin/jobs - Get all jobs (admin only)
router.get('/jobs', auth, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{ model: User, as: 'recruiter', attributes: ['name', 'email'] }],
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/jobs/:id/approve - Approve a job (admin only)
router.put('/jobs/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.isApproved = true;
    await job.save();
    const updatedJob = await Job.findByPk(req.params.id, {
      include: [{ model: User, as: 'recruiter', attributes: ['name', 'email'] }],
    });
    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/jobs/:id - Delete a job (admin only)
router.delete('/jobs/:id', auth, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/ban - Ban a user (admin only)
router.put('/users/:id/ban', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban another admin' });
    }
    user.isBanned = true;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// admin.js
router.put('/users/:id/unban', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBanned = false;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;