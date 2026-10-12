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
  const user = getStoredUser();
  const savedProfile = localStorage.getItem(STORAGE_KEY);
  let profile = savedProfile ? JSON.parse(savedProfile) : {};

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

export async function updateProfile(updates) {
  const current = await getProfile();
  const merged = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}