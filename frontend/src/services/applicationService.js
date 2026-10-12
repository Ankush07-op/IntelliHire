import api from "./api";

/**
 * Fetch all applications for a specific job (recruiter only).
 * @param {string} jobId - MongoDB job _id
 * Response: Array of Application documents (applicantId populated)
 */
export const fetchApplicationsByJob = (jobId) =>
  api.get(`/applications/job/${jobId}`).then((res) => res.data);

/**
 * Update the pipeline status of an application.
 * Valid statuses: 'Applied' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected'
 * @param {string} id - Application _id
 * @param {string} status - New status string
 * @param {object} [interviewDetails] - Optional interview details object
 * Response: { message, application }
 */
export const updateApplicationStatus = (id, status, interviewDetails = null) => {
  const payload = { status };
  if (interviewDetails) payload.interviewDetails = interviewDetails;
  return api.patch(`/applications/${id}/status`, payload).then((res) => res.data);
};

/**
 * Get a 15-minute expiring Cloudinary download URL for a resume.
 * @param {string} id - Application _id
 * Response: { downloadUrl, expiresIn }
 */
export const fetchResumeDownloadUrl = (id) =>
  api.get(`/applications/${id}/resume`).then((res) => res.data);

/**
 * Get the AI analysis result for an application.
 * @param {string} id - Application _id
 * Response: AIAnalysis document
 */
export const fetchApplicationAnalysis = (id) =>
  api.get(`/applications/${id}/analysis`).then((res) => res.data);

/**
 * Trigger re-analysis of a specific application.
 * @param {string} id - Application _id
 * Response: { message }
 */
export const reanalyzeApplication = (id) =>
  api.post(`/applications/${id}/reanalyze`).then((res) => res.data);
