import axiosInstance from "../../../api/axiosInstance";

function normalizeApplication(app) {
  if (!app) return null;
  const appliedDate = app.createdAt ? app.createdAt.slice(0, 10) : "";
  const updatedDate = app.updatedAt ? app.updatedAt.slice(0, 10) : appliedDate;

  const timeline = [{ status: "Applied", date: appliedDate }];
  if (app.status && app.status !== "Applied") {
    timeline.push({ status: app.status, date: updatedDate });
  }

  return {
    id: app._id,
    _id: app._id,
    jobId: app.jobId?._id || app.jobId,
    jobTitle: app.jobId?.title || "Job Position",
    company: app.jobId?.companyName || "Hiring Company",
    status: app.status || "Applied",
    appliedAt: appliedDate,
    resumeName: "Uploaded Resume",
    coverLetter: app.coverLetter || "",
    timeline,
  };
}

// payload: { fullName, email, phone, coverLetter, resume: File }
export async function applyToJob(jobId, jobInfo, payload) {
  const formData = new FormData();
  formData.append("jobId", jobId);
  if (payload.resume) {
    formData.append("resume", payload.resume);
  }
  if (payload.coverLetter) {
    formData.append("coverLetter", payload.coverLetter);
  }

  const { data } = await axiosInstance.post("/applications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizeApplication(data.application || data);
}

export async function getMyApplications() {
  const { data } = await axiosInstance.get("/applications/me");
  const rawList = Array.isArray(data) ? data : [];
  return rawList.map(normalizeApplication);
}

export async function getApplicationById(id) {
  const all = await getMyApplications();
  const app = all.find((a) => a.id === id || a._id === id);
  if (!app) {
    throw new Error("Application not found");
  }
  return app;
}