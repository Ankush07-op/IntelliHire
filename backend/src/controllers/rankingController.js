const Application = require('../models/Application');
const AIAnalysis = require('../models/AIAnalysis');
const Job = require('../models/Job');

// @desc    Get ranked candidates for a specific job with advanced filters
// @route   GET /api/jobs/:jobId/rankings
// @access  Private (Recruiter only)
const getRankedCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { minScore = 0, maxScore = 100, minExperience = 0, skill } = req.query;

    // Verify job exists and recruiter owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access rankings for this job' });
    }

    // Find all applications for this job
    const applications = await Application.find({ jobId }).select('_id applicantId status createdAt');
    const applicationIds = applications.map(app => app._id);

    // Build AI Analysis query filters
    let aiQuery = {
      applicationId: { $in: applicationIds },
      score: { $gte: Number(minScore), $lte: Number(maxScore) },
      experienceYears: { $gte: Number(minExperience) },
    };

    if (skill) {
      aiQuery.matchedSkills = { $in: [new RegExp(skill, 'i')] };
    }

    // Retrieve and populate ranked results
    const rankedAnalyses = await AIAnalysis.find(aiQuery)
      .populate({
        path: 'applicationId',
        select: 'applicantId status createdAt resumeUrl',
        populate: {
          path: 'applicantId',
          select: 'name email',
        },
      })
      .sort({ score: -1, experienceYears: -1 }); // Rank primarily by score, secondarily by experience

    res.json({
      count: rankedAnalyses.length,
      jobTitle: job.title,
      rankings: rankedAnalyses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRankedCandidates };