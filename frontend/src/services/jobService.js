import api from "./api";

/**
 * Fetch jobs with optional query params (status, search, page, limit).
 * Response: { jobs, page, pages, total }
 */
export const fetchJobs = (params = {}) =>
  api.get("/jobs", { params }).then((res) => res.data);

/**
 * Fetch a single job by MongoDB _id.
 * Response: Job document
 */
export const fetchJobById = (id) =>
  api.get(`/jobs/${id}`).then((res) => res.data);

/**
 * Create a new job requisition.
 * @param {{ title, description, requiredSkills, experienceLevel }} data
 * Response: Job document
 */
export const createJob = (data) =>
  api.post("/jobs", data).then((res) => res.data);

/**
 * Update an existing job.
 * @param {string} id - MongoDB _id
 * @param {object} data - Fields to update
 * Response: Updated Job document
 */
export const updateJob = (id, data) =>
  api.put(`/jobs/${id}`, data).then((res) => res.data);

/**
 * Soft-archive a job (sets status to 'archived').
 * @param {string} id - MongoDB _id
 * Response: { message, job }
 */
export const archiveJob = (id) =>
  api.patch(`/jobs/${id}/archive`).then((res) => res.data);
