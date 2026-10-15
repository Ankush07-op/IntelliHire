import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "./profileApi";
import SkillsInput from "./SkillsInput";
import Loader from "../../../components/Loader";
import { useToast } from "../../../context/ToastContext";

export default function ProfileForm() {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setForm)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillsChange = (skills) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, skills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setForm(updated);
      setSaved(true);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
      showError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading candidate profile..." />;
  if (!form) return null;

  // Calculate profile strength
  let score = 0;
  if (form.name?.trim()) score += 20;
  if (form.email?.trim()) score += 20;
  if (form.phone?.trim()) score += 15;
  if (form.location?.trim()) score += 15;
  if (Number(form.experienceYears) > 0) score += 15;
  if (Array.isArray(form.skills) && form.skills.length >= 3) score += 15;

  return (
    <div className="max-w-2xl mx-auto py-4">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Candidate Profile
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Keep your profile updated for automated application pre-fill and AI matching.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
            {(form.name || "C").charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Profile Strength Meter */}
        <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-700">Profile Strength</span>
            <span className={score === 100 ? "text-emerald-600" : "text-indigo-600"}>
              {score}% {score === 100 ? "· Complete 🎉" : "· Action Needed"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score === 100
                  ? "bg-emerald-500"
                  : score >= 60
                  ? "bg-indigo-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {score < 100
              ? "Tip: Add your contact number, experience years, and at least 3 skills to reach 100%."
              : "Great job! Your profile contains all the details recruiters and AI screening look for."}
          </p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3.5">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2">
            <span>✓</span> Profile saved successfully. Your applications will auto-fill with these details.
          </div>
        )}

        {/* Form Fields */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / City
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Years of Experience
          </label>
          <input
            type="number"
            name="experienceYears"
            min="0"
            value={form.experienceYears}
            onChange={handleChange}
            className="w-full sm:w-40 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Core Skills
          </label>
          <SkillsInput skills={form.skills} onChange={handleSkillsChange} />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Professional Summary
          </label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows={4}
            placeholder="A short summary about your experience, tech stack, and goals..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-indigo-600 text-white font-semibold rounded-xl px-8 py-3 hover:bg-indigo-700 disabled:opacity-60 shadow-xs transition-colors"
        >
          {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}