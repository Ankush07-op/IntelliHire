import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicationById } from "../features/applicant/applications/applicationsApi";
import StatusBadge from "../features/applicant/applications/StatusBadge.jsx";
import StatusTimeline from "../features/applicant/applications/StatusTimeline.jsx";
import Loader from "../components/Loader";
import axiosInstance from "../api/axiosInstance";
import { formatDate } from "../utils/formatDate";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    setLoading(true);
    getApplicationById(id)
      .then(setApplication)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleViewResume = async () => {
    setLoadingResume(true);
    try {
      const { data } = await axiosInstance.get(`/applications/${id}/resume`);
      const target = data.viewUrl || data.downloadUrl;
      if (target) {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    } catch {
      alert("Could not load resume document link.");
    } finally {
      setLoadingResume(false);
    }
  };

  if (loading) return <Loader label="Loading application..." />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4">
          {error}
        </div>
        <Link to="/my-applications" className="inline-block mt-4 text-sm text-indigo-600 font-semibold hover:underline">
          ← Back to my applications
        </Link>
      </div>
    );
  }

  const isInterview = application.status === "Interview";
  const isOffered = application.status === "Offered";

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Link
        to="/my-applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-4"
      >
        ← Back to my applications
      </Link>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              Application ID: {application.id?.slice(-6) || "ID"}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
              {application.jobTitle}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {application.company}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Submitted on {formatDate(application.appliedAt)}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Interview Callout Banner */}
        {isInterview && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="text-sm font-bold text-blue-950">
                  You've been invited for an interview!
                </h3>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  The hiring team has shortlisted your application and scheduled an interview round. Check your email for direct calendar invitations and preparation details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Offer Callout Banner */}
        {isOffered && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Congratulations! Job Offer Extended
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  The team has extended a formal offer for this position. The recruiter will reach out with the offer letter package.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Stage Progress Stepper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Pipeline Status</h2>
          <StatusTimeline
            currentStatus={application.status}
            timeline={application.timeline}
          />
        </div>

        {/* Resume Document Box */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {application.resumeName || "Submitted Resume"}
                </h3>
                <p className="text-xs text-slate-500">Verified Cloudinary Document</p>
              </div>
            </div>

            <button
              onClick={handleViewResume}
              disabled={loadingResume}
              className="text-xs font-semibold px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              {loadingResume ? "Loading link..." : "View Document ↗"}
            </button>
          </div>
        </div>

        {/* Cover Letter Section */}
        {application.coverLetter && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Cover Letter / Note</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {application.coverLetter}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}