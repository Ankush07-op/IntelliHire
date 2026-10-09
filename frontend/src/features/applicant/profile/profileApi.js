// Temporary in-memory mock. Replace the body of these functions with
// axiosInstance calls once the real backend endpoint is ready.

let MOCK_PROFILE = {
    name: "Demo User",
    email: "demo@test.com",
    phone: "",
    location: "",
    skills: ["React", "JavaScript"],
    experienceYears: "",
    summary: "",
};

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProfile() {
    await delay(400);
    return { ...MOCK_PROFILE };
}

export async function updateProfile(updates) {
    await delay(500);
    MOCK_PROFILE = { ...MOCK_PROFILE, ...updates };
    return { ...MOCK_PROFILE };
}