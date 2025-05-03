const express = require('express');
const router = express.Router();
const { Job, User, Application } = require('../models').models;
const auth = require('../middleware/auth');
const notifier = require('../utils/notifier');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: Admins only',
        yourRole: req.user.role
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin middleware',
      error: error.message 
    });
  }
};

// Get all users for admin dashboard
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching users...');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'isBanned'],
      order: [['createdAt', 'DESC']]
    }).catch(err => {
      console.error('Sequelize query error (users):', err);
      throw new Error('Database query failed: ' + err.message);
    });
    console.log('Users fetched:', users.length);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// Get all jobs with applications count
router.get('/jobs', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching jobs...');
    const jobs = await Job.findAll({
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: Application,
          as: 'applications',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    }).catch(err => {
      console.error('Sequelize query error (jobs):', err);
      throw new Error('Database query failed: ' + err.message);
    });
    console.log('Jobs fetched:', jobs.length);
    const formattedJobs = jobs.map(job => {
      const plainJob = job.get({ plain: true });
      return {
        ...plainJob,
        applications: Array.isArray(plainJob.applications) ? plainJob.applications.length : 0
      };
    });
    res.json({
      success: true,
      data: formattedJobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message 
    });
  }
});

// Approve a job - add more error handling
router.patch('/jobs/:jobId/approve', auth, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['email']
      }]
    });
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Update job status
    const [updated] = await Job.update(
      { isApproved: true },
      { where: { id: req.params.jobId } }
    );
    
    if (updated !== 1) {
      throw new Error('Failed to update job status');
    }

    // Send notification if recruiter exists
    if (job.recruiter && job.recruiter.email) {
      try {
        await notifier.sendNotification(
          job.recruiter.email,
          'Job Approval Notification',
          `Your job posting "${job.title}" has been approved by an admin.`,
          job.createdAt
        );
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Don't fail the whole request if notification fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Job approved successfully',
      jobId: req.params.jobId
    });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve job', 
      error: error.message 
    });
  }
});

// Reject a job - add more error handling
router.patch('/jobs/:jobId/reject', auth, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['email']
      }]
    });
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Send notification before deletion
    if (job.recruiter && job.recruiter.email) {
      try {
        await notifier.sendNotification(
          job.recruiter.email,
          'Job Rejection Notification',
          `Your job posting "${job.title}" has been rejected by an admin.`,
          job.createdAt
        );
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Don't fail the whole request if notification fails
      }
    }

    // Delete the job
    const deleted = await Job.destroy({
      where: { id: req.params.jobId }
    });
    
    if (deleted !== 1) {
      throw new Error('Failed to delete job');
    }

    res.json({ 
      success: true, 
      message: 'Job rejected and deleted successfully',
      jobId: req.params.jobId
    });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject job', 
      error: error.message 
    });
  }
});


// Delete a job
router.delete('/jobs/:jobId', auth, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['email']
      }]
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.recruiter && job.recruiter.email) {
      await notifier.sendNotification(
        job.recruiter.email,
        'Job Deletion Notification',
        `Your job posting "${job.title}" has been deleted by an admin.`,
        job.createdAt
      );
    }
    await job.destroy();
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
  }
});

// Ban a user
router.patch('/users/:userId/ban', auth, isAdmin, async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (targetUser.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban an admin user' });
    }
    await targetUser.update({ isBanned: true });
    res.json({ success: true, message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ success: false, message: 'Failed to ban user', error: error.message });
  }
});

// Unban a user
router.patch('/users/:userId/unban', auth, isAdmin, async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await targetUser.update({ isBanned: false });
    res.json({ success: true, message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ success: false, message: 'Failed to unban user', error: error.message });
  }
});

module.exports = router;