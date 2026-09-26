const Application = require('../models/Application');
const Job = require('../models/Job');
const { triggerAIAnalysis } = require('../services/aiService');

// @desc    Submit a new job application
// @route   POST /api/applications
// @access  Private (Applicant only)
const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ message: 'Job ID and resume URL are required' });
    }

    // Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this position' });
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      resumeUrl,
    });

    // Trigger AI Analysis Asynchronously (Non-blocking)
    triggerAIAnalysis(
      application._id,
      resumeUrl,
      job.description,
      job.requiredSkills
    );

    // Return response immediately to applicant
    res.status(201).json({
      message: 'Application submitted successfully. AI parsing in progress.',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only - Job owner check)
const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify recruiter owns the job
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'name email resumeUrl')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get application history for logged-in applicant
// @route   GET /api/applications/me
// @access  Private (Applicant only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title companyName status experienceLevel')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getApplicationsByJob,
  getMyApplications,
};