const Application = require('../models/Application');
const Job = require('../models/Job');
const { triggerAIAnalysis } = require('../services/aiService');
const AIAnalysis = require('../models/AIAnalysis');
const { sendStatusUpdateEmail, sendInterviewInviteEmail } = require('../services/emailService');
const { uploadToS3 } = require('../services/s3Service');
const { getPresignedDownloadUrl } = require('../services/s3Service');

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

    // Upload file buffer to AWS S3 and get key
    const s3Key = await uploadToS3(file);

    // Save Application record in MongoDB
    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      resumeUrl: s3Key, // Storing S3 key
    });

    // Trigger AI Analysis Asynchronously (Non-blocking)
    triggerAIAnalysis(
      application._id,
      s3Key,
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

// @desc    Get AI Analysis details for an application
// @route   GET /api/applications/:id/analysis
// @access  Private (Recruiter only)
const getApplicationAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await AIAnalysis.findOne({ applicationId: id });

    if (!analysis) {
      return res.status(404).json({ 
        message: 'AI analysis is still processing or unavailable for this application' 
      });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application pipeline status & trigger email notification
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewDetails } = req.body;

    const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid pipeline status' });
    }

    const application = await Application.findById(id)
      .populate('applicantId', 'name email')
      .populate('jobId', 'title recruiterId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify requesting recruiter owns the job
    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this status' });
    }

    application.status = status;
    await application.save();

    // Trigger automated email notification (M2 logic)
    if (status === 'Interview' && interviewDetails) {
      await sendInterviewInviteEmail(
        application.applicantId.email,
        application.applicantId.name,
        application.jobId.title,
        interviewDetails
      );
    } else {
      await sendStatusUpdateEmail(
        application.applicantId.email,
        application.applicantId.name,
        application.jobId.title,
        status
      );
    }

    res.json({ message: 'Status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get secure pre-signed resume download URL
// @route   GET /api/applications/:id/resume
// @access  Private (Applicant who owns resume OR Recruiter who owns job)
const getResumeDownloadUrl = async (req, res) => {
  try {
    // Populate job details to perform recruiter ownership check
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'recruiterId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const userId = req.user.id;
    const isApplicant = application.applicantId.toString() === userId;
    const isJobOwnerRecruiter =
      req.user.role === 'recruiter' &&
      application.jobId.recruiterId.toString() === userId;

    // Reject access if user is neither the candidate nor the hiring recruiter
    if (!isApplicant && !isJobOwnerRecruiter) {
      return res.status(403).json({
        message: 'Not authorized to access this candidate document',
      });
    }

    // Generate 15-minute expiring pre-signed URL from AWS S3 key
    const downloadUrl = await getPresignedDownloadUrl(application.resumeUrl);

    res.json({
      downloadUrl,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getApplicationsByJob,
  getMyApplications,
  getApplicationAnalysis,
  updateApplicationStatus,
  getResumeDownloadUrl,
};