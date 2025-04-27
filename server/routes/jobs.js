const express = require('express');
const router = express.Router();
const { Job, User, Application } = require('../models').models;
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  const { title, location, contract } = req.query;
  const where = {};
  if (title) where.title = { [Op.like]: `%${title}%` };
  if (location) where.location = { [Op.like]: `%${location}%` };
  if (contract) {
    const validContracts = ['full-time', 'part-time', 'contract'];
    if (!validContracts.includes(contract)) {
      return res.status(400).json({ message: 'Invalid contract type' });
    }
    where.contract = contract;
  }

  try {
    const jobs = await Job.findAll({
      where,
      include: [{ model: User, as: 'recruiter', attributes: ['name'] }],
    });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Only recruiters can post jobs' });
  }

  const { title, company, location, description, contract } = req.body;
  try {
    const job = await Job.create({
      title,
      company,
      location,
      description,
      contract,
      recruiterId: req.user.id,
    });
    res.status(201).json(job);
  } catch (err) {
    console.error('Error posting job:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/apply', auth, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Only candidates can apply' });
  }

  const { jobId } = req.body;
  try {
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existingApplication = await Application.findOne({
      where: { jobId, candidateId: req.user.id },
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
    });
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    console.error('Error applying to job:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.get('/:jobId/applicants', auth, async (req, res) => {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can view applicants' });
    }
  
    const { jobId } = req.params;
  
    try {
      // 1. Find the job
      const job = await Job.findByPk(jobId);
  
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // 2. Check if the recruiter owns the job
      if (job.recruiterId !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to view applicants for this job' });
      }
  
      // 3. Get all applications with candidate info
      const applications = await Application.findAll({
        where: { jobId },
        include: [{ model: User, as: 'candidate', attributes: ['id', 'name', 'email'] }],
      });
  
      res.json(applications);
  
    } catch (err) {
      console.error('Error fetching applicants:', err.message, err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  router.get('/my-jobs', auth, async (req, res) => {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can view their jobs' });
    }
  
    try {
      const jobs = await Job.findAll({
        where: { recruiterId: req.user.id },
        include: [
          {
            model: Application,
            as: 'applications',  // Use the correct alias here
            include: [
              {
                model: User,
                as: 'candidate',  // Assuming 'candidate' is the alias for the associated User model
                attributes: ['id', 'name', 'email'],
              }
            ]
          }
        ],
      });
  
      res.json(jobs);
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err.message, err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  

module.exports = router;