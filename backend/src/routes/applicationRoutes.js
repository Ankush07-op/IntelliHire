const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getApplicationsByJob,
  getMyApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Applicant routes
router.post('/', protect, authorize('applicant'), applyForJob);
router.get('/me', protect, authorize('applicant'), getMyApplications);

// Recruiter route
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicationsByJob);

module.exports = router;