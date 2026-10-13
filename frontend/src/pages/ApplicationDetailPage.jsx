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
      <div className="max-w-2xl mx-auto">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
        <Link to="/my-applications" className="inline-block mt-4 text-sm text-blue-700 font-medium">
          ← Back to my applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/my-applications" className="text-sm text-blue-700 font-medium">
        ← Back to my applications
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{application.jobTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{application.company}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Applied on {formatDate(application.appliedAt)}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-0.5">Resume Document</h2>
              <p className="text-sm text-slate-600">📄 {application.resumeName || "Submitted Resume"}</p>
            </div>
            <button
              onClick={handleViewResume}
              disabled={loadingResume}
              className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
            >
              {loadingResume ? "Loading link..." : "View / Download ↗"}
            </button>
          </div>
        </div>

        {application.coverLetter && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Cover letter</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{application.coverLetter}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Application status</h2>
          <StatusTimeline timeline={application.timeline} />
        </div>
      </div>
    </div>
  );
}