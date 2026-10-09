// Temporary in-memory mock. Replace the body of applyToJob() with an
// axiosInstance multipart/form-data POST once the real backend is ready.

const MOCK_APPLICATIONS = [
    {
        id: "a1",
        jobId: "1",
        jobTitle: "Frontend Engineer",
        company: "Northwind Tech",
        status: "Interview",
        appliedAt: "2026-09-24",
        resumeName: "resume_jane.pdf",
        coverLetter: "Excited to apply for this role.",
        timeline: [
            { status: "Applied", date: "2026-09-24" },
            { status: "Screening", date: "2026-09-26" },
            { status: "Interview", date: "2026-09-29" },
        ],
    },
];

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// payload: { fullName, email, phone, coverLetter, resume: File }
export async function applyToJob(jobId, jobInfo, payload) {
    await delay(800);

    const alreadyApplied = MOCK_APPLICATIONS.some((a) => a.jobId === jobId);
    if (alreadyApplied) {
        throw new Error("You have already applied to this job.");
    }

    const newApplication = {
        id: `a${MOCK_APPLICATIONS.length + 1}`,
        jobId,
        jobTitle: jobInfo.title,
        company: jobInfo.company,
        status: "Applied",
        appliedAt: new Date().toISOString().slice(0, 10),
        resumeName: payload.resume.name,
        coverLetter: payload.coverLetter,
        timeline: [{ status: "Applied", date: new Date().toISOString().slice(0, 10) }],
    };

    MOCK_APPLICATIONS.push(newApplication);
    return newApplication;
}

export async function getMyApplications() {
    await delay(400);
    return MOCK_APPLICATIONS;
}

export async function getApplicationById(id) {
    await delay(300);
    const app = MOCK_APPLICATIONS.find((a) => a.id === id);
    if (!app) throw new Error("Application not found");
    return app;
}