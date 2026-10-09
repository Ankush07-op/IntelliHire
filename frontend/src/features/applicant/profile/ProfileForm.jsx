import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "./profileApi";
import SkillsInput from "./SkillsInput";
import Loader from "../../../components/Loader";

export default function ProfileForm() {
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
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader label="Loading profile..." />;
    if (!form) return null;

    return (
        <form onSubmit={handleSubmit} className="max-w-xl bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-6">My profile</h1>

            {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}
            {saved && (
                <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Profile saved.
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of experience</label>
                <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className="w-full sm:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                <SkillsInput skills={form.skills} onChange={handleSkillsChange} />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
                <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    rows={4}
                    placeholder="A short summary about your experience and goals..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-blue-700 disabled:opacity-60"
            >
                {saving ? "Saving..." : "Save profile"}
            </button>
        </form>
    );
}