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
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Already Submitted</h2>
        <p className="text-sm text-slate-500 mt-2">
          You already submitted an application for <span className="font-semibold">{job.title}</span> on{" "}
          {formatDate(existingApp.appliedAt)}.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Current status:</span>
          <StatusBadge status={existingApp.status} />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/applications/${existingApp.id}`}
            className="bg-blue-600 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-blue-700 text-sm"
          >
            View My Application
          </Link>
          <Link
            to="/jobs"
            className="border border-slate-300 text-slate-700 font-semibold rounded-lg px-5 py-2.5 hover:bg-slate-50 text-sm"
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