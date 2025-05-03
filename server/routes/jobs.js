const express = require('express');
const router = express.Router();
const { Job, User, Application, Message, Notification } = require('../models').models;
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const multer = require('multer');
const upload = multer();
router.get('/', async (req, res) => {
  const { title, location, contract } = req.query;
  const where = { isApproved: true };
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

// Update the route to use multer middleware
router.post('/:id/apply', auth, upload.any(), async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Only candidates can apply' });
  }

  const { id: jobId } = req.params;
  
  // Extract text fields from req.body
  const { cv, motivationLetter, contact, note } = req.body;
  
  // Files will be in req.files
  const files = req.files || [];

  try {
    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: 'recruiter', attributes: ['id', 'name'] }],
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existingApplication = await Application.findOne({
      where: { jobId, candidateId: req.user.id },
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    
    if (!cv || !motivationLetter || !contact) {
      return res.status(400).json({ message: 'CV, motivation letter, and contact are required' });
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(contact)) {
      return res.status(400).json({ message: 'Contact must be a valid phone number (minimum 10 digits, may include +, spaces, or dashes)' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      cv,
      motivationLetter,
      contact,
      note: note || null,
      status: 'pending',
      appliedAt: new Date(),
    });

    // Handle file storage if needed (you'll need additional logic here)
    // ...

    await Notification.create({
      recipientId: req.user.id,
      applicationId: application.id,
      jobId: job.id,
      message: `You have successfully applied for ${job.title} at ${job.company}.`,
    });

    await Notification.create({
      recipientId: job.recruiter.id,
      applicationId: application.id,
      jobId: job.id,
      message: `A candidate (${req.user.name}) has applied for your job: ${job.title} at ${job.company}.`,
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
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
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view applicants for this job' });
    }
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
          as: 'applications',
          include: [
            {
              model: User,
              as: 'candidate',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching recruiter jobs:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/my-applications', auth, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Only candidates can view their applications' });
  }

  try {
    const applications = await Application.findAll({
      where: { candidateId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location'],
          include: [
            {
              model: User,
              as: 'recruiter',
              attributes: ['name', 'id'],
            },
          ],
        },
      ],
    });
    res.json(applications);
  } catch (err) {
    console.error('Error fetching candidate applications:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/applications/:id/accept', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job, as: 'job' },
        { model: User, as: 'candidate', attributes: ['id', 'name'] },
      ],
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    application.status = 'accepted';
    await application.save();

    await Notification.create({
      recipientId: application.candidate.id,
      applicationId: application.id,
      jobId: application.job.id,
      message: `Your application for ${application.job.title} at ${application.job.company} has been accepted!`,
    });

    const updatedApplication = await Application.findByPk(req.params.id, {
      include: [{ model: User, as: 'candidate', attributes: ['name', 'email'] }],
    });
    res.json(updatedApplication);
  } catch (err) {
    console.error('Error accepting application:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/applications/:id/reject', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job, as: 'job' },
        { model: User, as: 'candidate', attributes: ['id', 'name'] },
      ],
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    application.status = 'rejected';
    await application.save();

    await Notification.create({
      recipientId: application.candidate.id,
      applicationId: application.id,
      jobId: application.job.id,
      message: `Your application for ${application.job.title} at ${application.job.company} has been rejected.`,
    });

    const updatedApplication = await Application.findByPk(req.params.id, {
      include: [{ model: User, as: 'candidate', attributes: ['name', 'email'] }],
    });
    res.json(updatedApplication);
  } catch (err) {
    console.error('Error rejecting application:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/applications/:id/contact', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job, as: 'job' },
        { model: User, as: 'candidate', attributes: ['id', 'name'] },
      ],
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notification.create({
      recipientId: application.candidate.id,
      applicationId: application.id,
      jobId: application.job.id,
      message: `The recruiter for ${application.job.title} at ${application.job.company} has contacted you. Check your messages for more details.`,
    });

    res.json({ message: `Contacted candidate ${application.candidate.name}` });
  } catch (err) {
    console.error('Error contacting candidate:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/applications/:id/message', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { 
          model: Job, 
          as: 'job',
          include: [
            { model: User, as: 'recruiter', attributes: ['id', 'name', 'email'] }
          ]
        },
        { 
          model: User, 
          as: 'candidate', 
          attributes: ['id', 'name', 'email'] 
        }
      ],
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify permissions
    if (req.user.role === 'recruiter' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'candidate' && application.candidateId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ message: 'Message content cannot exceed 1000 characters' });
    }

    // Determine recipient
    const recipientId = req.user.role === 'recruiter' 
      ? application.candidateId 
      : application.job.recruiterId;

    // Create message
    const message = await Message.create({
      applicationId: req.params.id,
      senderId: req.user.id,
      recipientId,
      content: content.trim(),
      sentAt: new Date(),
      isRead: false,
    });

    // Create notification for recipient
    await Notification.create({
      recipientId,
      applicationId: application.id,
      jobId: application.job.id,
      message: `New message about ${application.job.title} at ${application.job.company}`,
      isRead: false,
      createdAt: new Date()
    });

    // Populate response with sender/recipient info
    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'recipient', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('Error sending message:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/applications/:id/messages', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: 'job' }],
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role === 'recruiter' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'candidate' && application.candidateId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { applicationId: req.params.id },
      include: [
        { model: User, as: 'sender', attributes: ['name'] },
        { model: User, as: 'recipient', attributes: ['name'] },
      ],
      order: [['sentAt', 'ASC']],
    });

    for (const message of messages) {
      if (message.recipientId === req.user.id && !message.isRead) {
        message.isRead = true;
        await message.save();
      }
    }

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/applications/:id', auth, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { 
          model: Job, 
          as: 'job', 
          include: [{ 
            model: User, 
            as: 'recruiter', 
            attributes: ['id', 'name'] 
          }] 
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidateId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot withdraw non-pending application' 
      });
    }

    await application.destroy();

    await Notification.create({
      recipientId: application.job.recruiter.id,
      applicationId: application.id,
      jobId: application.job.id,
      message: `A candidate (${req.user.name}) has withdrawn their application for ${application.job.title} at ${application.job.company}.`,
    });

    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    console.error('Error withdrawing application:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      include: [
        { model: Application, as: 'application', attributes: ['id'] },
        { model: Job, as: 'job', attributes: ['title', 'company'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.recipientId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { recipientId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      attributes: [
        'id',
        'title',
        'company',
        'location',
        'description',
        'contract',
        'requirements',
        'salary',
        'createdAt',
        'isApproved',
        'recruiterId',
      ],
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['name'],
          required: false,
        },
      ],
    });
    if (!job || !job.isApproved) {
      return res.status(404).json({ message: 'Job not found or not approved' });
    }
    res.json(job);
  } catch (err) {
    console.error('Error fetching job:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;