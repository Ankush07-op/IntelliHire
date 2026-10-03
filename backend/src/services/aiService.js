const axios = require('axios');
const AIAnalysis = require('../models/AIAnalysis');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Triggers AI processing with exponential backoff retry logic (up to 3 attempts)
 */
const triggerAIAnalysis = async (applicationId, s3Key, jobDescription, requiredSkills, retries = 3) => {
  setImmediate(async () => {
    let attempt = 0;
    let delay = 2000; // Start with 2 second delay

    while (attempt < retries) {
      try {
        console.log(`[AI Worker] Processing application ${applicationId} (Attempt ${attempt + 1}/${retries})`);

        // Generate short-lived pre-signed URL so Python service can download the PDF/DOCX from S3
        const temporaryResumeUrl = await getPresignedDownloadUrl(s3Key);

        // Call FastAPI microservice
        const response = await axios.post(
          `${AI_SERVICE_URL}/api/analyze`,
          {
            application_id: applicationId,
            resume_url: temporaryResumeUrl,
            job_description: jobDescription,
            required_skills: requiredSkills,
          },
          { timeout: 45000 } // 45s safety timeout for LLM response
        );

        const { score, matchedSkills, missingSkills, experienceYears, summary } = response.data;

        // Save or update AI Analysis record in MongoDB
        await AIAnalysis.findOneAndUpdate(
          { applicationId },
          {
            applicationId,
            score,
            matchedSkills,
            missingSkills,
            experienceYears,
            summary,
            status: 'completed',
          },
          { upsert: true, new: true }
        );

        console.log(`[AI Worker Success] Application ${applicationId} parsed successfully.`);
        return; // Exit retry loop on success
      } catch (error) {
        attempt++;
        console.error(`[AI Worker Error] Attempt ${attempt} failed for application ${applicationId}:`, error.message);

        if (attempt < retries) {
          // Exponential backoff wait
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; 
        } else {
          // Final Failure Handler - Mark in database so recruiter sees "Failed to Process"
          await AIAnalysis.findOneAndUpdate(
            { applicationId },
            {
              applicationId,
              score: 0,
              matchedSkills: [],
              missingSkills: [],
              experienceYears: 0,
              summary: 'Automated AI parsing failed after multiple attempts. Manual review required.',
              status: 'failed',
            },
            { upsert: true }
          );
          console.error(`[AI Worker Terminated] Max retries reached for application ${applicationId}.`);
        }
      }
    }
  });
};

module.exports = { triggerAIAnalysis };