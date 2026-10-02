import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicationById } from "../features/applicant/applications/applicationsApi";
import StatusBadge from "../features/applicant/applications/StatusBadge.jsx";
import StatusTimeline from "../features/applicant/applications/StatusTimeline.jsx";
import Loader from "../components/Loader";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getApplicationById(id)
      .then(setApplication)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading application..." />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
        <Link to="/applications" className="inline-block mt-4 text-sm text-blue-700 font-medium">
          ← Back to my applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/applications" className="text-sm text-blue-700 font-medium">
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
          Applied on {new Date(application.appliedAt).toLocaleDateString()}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Resume</h2>
          <p className="text-sm text-slate-600">📄 {application.resumeName}</p>
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