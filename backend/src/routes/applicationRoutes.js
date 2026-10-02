const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getApplicationsByJob,
  getMyApplications,
  getApplicationAnalysis,
  updateApplicationStatus,
  getResumeDownloadUrl,
  getApplicationAnalysis,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { aiTriggerLimiter } = require('../middlewares/rateLimiter');
const upload = require('../middlewares/uploadMiddleware');

// Applicant routes
router.post('/', protect, authorize('applicant'), aiTriggerLimiter, upload.single('resume'), applyForJob);
router.get('/me', protect, authorize('applicant'), getMyApplications);

// Recruiter route
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicationsByJob);
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);
router.get('/:id/resume', protect, getResumeDownloadUrl);
router.get('/:id/analysis', protect, authorize('recruiter'), getApplicationAnalysis);

module.exports = router;