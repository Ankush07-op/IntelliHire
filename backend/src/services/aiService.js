const axios = require('axios');
const AIAnalysis = require('../models/AIAnalysis');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Triggers AI processing asynchronously for a given application
 */
const triggerAIAnalysis = async (applicationId, resumeUrl, jobDescription, requiredSkills) => {
  // Run asynchronously in the background
  setImmediate(async () => {
    try {
      console.log(`[AI Queue] Processing application: ${applicationId}`);

      // Call M3's FastAPI microservice
      const response = await axios.post(`${AI_SERVICE_URL}/api/analyze`, {
        application_id: applicationId,
        resume_url: resumeUrl,
        job_description: jobDescription,
        required_skills: requiredSkills,
      }, { timeout: 30000 }); // 30s timeout safety net

      const { score, matchedSkills, missingSkills, experienceYears, summary } = response.data;

      // Save AI result to MongoDB mapped to the application record
      await AIAnalysis.create({
        applicationId,
        score,
        matchedSkills,
        missingSkills,
        experienceYears,
        summary,
      });

      console.log(`[AI Queue] Analysis complete for application: ${applicationId}`);
    } catch (error) {
      console.error(`[AI Queue Error] Failed for application ${applicationId}:`, error.message);
      // Optional: Log failure state or retry logic (M2 task)
    }
  });
};

module.exports = { triggerAIAnalysis };