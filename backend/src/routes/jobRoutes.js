const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  archiveJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter-only protected routes
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.patch('/:id/archive', protect, authorize('recruiter'), archiveJob);

module.exports = router;