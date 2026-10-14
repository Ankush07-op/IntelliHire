import axiosInstance from "../../../api/axiosInstance";

const STORAGE_KEY = "ats_candidate_profile";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("ats_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getProfile() {
  try {
    const { data } = await axiosInstance.get("/auth/me");
    const profile = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : ["React", "JavaScript"],
      experienceYears: data.experienceYears !== undefined && data.experienceYears !== null ? String(data.experienceYears) : "",
      summary: data.summary || "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    // Fallback to local session storage cache
    const user = getStoredUser();
    const saved = localStorage.getItem(STORAGE_KEY);
    let profile = saved ? JSON.parse(saved) : {};
    return {
      name: user?.name || profile.name || "Candidate",
      email: user?.email || profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      skills: profile.skills || ["React", "JavaScript"],
      experienceYears: profile.experienceYears || "",
      summary: profile.summary || "",
      ...profile,
    };
  }
}

export async function updateProfile(updates) {
  try {
    const payload = {
      ...updates,
      experienceYears: updates.experienceYears ? Number(updates.experienceYears) : 0,
    };
    const { data } = await axiosInstance.put("/auth/profile", payload);
    const profile = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      skills: data.skills || [],
      experienceYears: data.experienceYears !== undefined && data.experienceYears !== null ? String(data.experienceYears) : "",
      summary: data.summary || "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    const current = await getProfile();
    const merged = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }
}