// Temporary in-memory mock. Replace the body of these functions with
// axiosInstance calls once the real backend endpoint is ready.

const MOCK_JOBS = [
    {
        id: "1",
        title: "Frontend Engineer",
        company: "Northwind Tech",
        location: "Bengaluru",
        type: "Full-time",
        skills: ["React", "Tailwind", "JavaScript"],
        description: "Build and maintain our customer-facing web application.",
        postedAt: "2026-09-20",
    },
    {
        id: "2",
        title: "Data Analyst",
        company: "Contoso Labs",
        location: "Remote",
        type: "Contract",
        skills: ["SQL", "Python", "Excel"],
        description: "Analyze product usage data and build recurring reports.",
        postedAt: "2026-09-22",
    },
    {
        id: "3",
        title: "Backend Engineer (Node.js)",
        company: "Northwind Tech",
        location: "Bengaluru",
        type: "Full-time",
        skills: ["Node.js", "Express", "MongoDB"],
        description: "Design and build REST APIs for our recruitment platform.",
        postedAt: "2026-09-18",
    },
    {
        id: "4",
        title: "HR Intern",
        company: "Vantage Corp",
        location: "Mumbai",
        type: "Internship",
        skills: ["Communication", "Excel"],
        description: "Support the recruitment team with candidate coordination.",
        postedAt: "2026-09-25",
    },
];

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// filters: { search, location, type }
export async function getJobs(filters = {}) {
    await delay(400);

    let results = [...MOCK_JOBS];

    if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
            (job) =>
                job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                job.skills.some((s) => s.toLowerCase().includes(q))
        );
    }

    if (filters.location) {
        results = results.filter((job) => job.location === filters.location);
    }

    if (filters.type) {
        results = results.filter((job) => job.type === filters.type);
    }

    return results;
}

export async function getJobById(id) {
    await delay(300);
    const job = MOCK_JOBS.find((j) => j.id === id);
    if (!job) throw new Error("Job not found");
    return job;
}