const express = require('express');
const router = express.Router();
const { getRankedCandidates } = require('../controllers/rankingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/job/:jobId', protect, authorize('recruiter'), getRankedCandidates);

module.exports = router;