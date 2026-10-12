import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyToJob } from "./applicationsApi";
import ResumeUploader from "./ResumeUploader";
import { useAuth } from "../auth/AuthContext";

// Props: job (the full job object from JobDetailPage/ApplyPage)
export default function ApplyForm({ job }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        coverLetter: "",
    });
    const [resume, setResume] = useState(null);
    const [resumeError, setResumeError] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResumeChange = (file, error) => {
        setResume(file);
        setResumeError(error || "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!form.fullName || !form.email || !form.phone) {
            setFormError("Please fill in all required fields.");
            return;
        }
        if (!resume) {
            setResumeError("Please attach your resume.");
            return;
        }

        setSubmitting(true);
        try {
            await applyToJob(job.id, job, { ...form, resume });
            setSuccess(true);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <h2 className="text-xl font-bold text-slate-900">Application submitted</h2>
                <p className="text-sm text-slate-500 mt-1">
                    You've applied to <span className="font-medium">{job.title}</span> at {job.company}.
                </p>
                <button
                    onClick={() => navigate("/applications")}
                    className="mt-6 bg-blue-600 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700"
                >
                    View my applications
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-xl font-bold text-slate-900">Apply for {job.title}</h1>
            <p className="text-sm text-slate-500 mb-6">{job.company} · {job.location}</p>

            {formError && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
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
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover letter (optional)</label>
                <textarea
                    name="coverLetter"
                    value={form.coverLetter}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell them why you're a good fit..."
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Resume</label>
                <ResumeUploader value={resume} onChange={handleResumeChange} error={resumeError} />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2.5 hover:bg-blue-700 disabled:opacity-60"
            >
                {submitting ? "Submitting..." : "Submit application"}
            </button>
        </form>
    );
}