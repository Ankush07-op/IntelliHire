import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById } from "../features/applicant/jobs/jobsApi";
import { getMyApplications } from "../features/applicant/applications/applicationsApi";
import { useAuth } from "../features/applicant/auth/AuthContext";
import ApplyForm from "../features/applicant/applications/ApplyForm";
import Loader from "../components/Loader";
import StatusBadge from "../features/applicant/applications/StatusBadge";
import { formatDate } from "../utils/formatDate";

export default function ApplyPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const promises = [getJobById(id)];
    if (isAuthenticated) {
      promises.push(getMyApplications().catch(() => []));
    }

    Promise.all(promises)
      .then(([jobData, myApps = []]) => {
        setJob(jobData);
        if (Array.isArray(myApps)) {
          const matched = myApps.find(
            (app) => String(app.jobId) === String(id) || String(app.jobId?._id) === String(id)
          );
          setExistingApp(matched || null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading) return <Loader label="Loading job..." />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
        <Link to="/jobs" className="inline-block mt-4 text-sm text-blue-700 font-medium">
          ← Back to job board
        </Link>
      </div>
    );
  }

  if (existingApp) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-xs">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-indigo-100/80">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Already Submitted</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You already submitted an application for <span className="font-bold text-slate-700">{job.title}</span> on{" "}
          {formatDate(existingApp.appliedAt)}.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-semibold text-slate-500">Current status:</span>
          <StatusBadge status={existingApp.status} />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/applications/${existingApp.id}`}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl px-5 py-2.5 hover:from-indigo-700 hover:to-violet-700 text-sm shadow-xs transition-all"
          >
            View My Application &rarr;
          </Link>
          <Link
            to="/jobs"
            className="border border-slate-300 text-slate-700 font-bold rounded-xl px-5 py-2.5 hover:bg-slate-50 text-sm transition-colors"
          >
            Browse Other Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <ApplyForm job={job} />
    </div>
  );
}