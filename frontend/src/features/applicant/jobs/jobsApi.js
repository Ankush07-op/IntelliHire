import axiosInstance from "../../../api/axiosInstance";

function normalizeJob(job) {
  if (!job) return null;
  return {
    id: job._id,
    _id: job._id,
    title: job.title,
    company: job.recruiterId?.companyName || "Company",
    location: job.location || "Remote",
    type: job.experienceLevel || "Full-time",
    skills: job.requiredSkills || [],
    description: job.description,
    postedAt: job.createdAt ? job.createdAt.slice(0, 10) : "",
    recruiterId: job.recruiterId,
  };
}

// filters: { search, location, type }
export async function getJobs(filters = {}) {
  const params = { status: "active" };
  if (filters.search) {
    params.search = filters.search;
  }

  const { data } = await axiosInstance.get("/jobs", { params });
  const rawJobs = Array.isArray(data) ? data : data.jobs || [];
  let normalized = rawJobs.map(normalizeJob);

  if (filters.type) {
    normalized = normalized.filter((j) => j.type === filters.type);
  }

  return normalized;
}

export async function getJobById(id) {
  const { data } = await axiosInstance.get(`/jobs/${id}`);
  return normalizeJob(data);
}