import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getJobById } from "../features/applicant/jobs/jobsApi";
import { getMyApplications } from "../features/applicant/applications/applicationsApi";
import { useAuth } from "../features/applicant/auth/AuthContext";
import Loader from "../components/Loader";
import StatusBadge from "../features/applicant/applications/StatusBadge";
import { formatDate } from "../utils/formatDate";


export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

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

  const handleApplyClick = () => {
    if (isAuthenticated) {
      navigate(`/jobs/${id}/apply`);
    } else {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}/apply` } } });
    }
  };

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

  return (
    <div className="max-w-3xl mx-auto py-2">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
      >
        <span aria-hidden="true">&larr;</span> Back to job board
      </Link>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0">
              {(job.company || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {job.company} &middot; <span className="text-slate-600">{job.location}</span>
              </p>
            </div>
          </div>
          <span className="self-start text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 px-3 py-1 rounded-full">
            {job.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-5">
          {job.skills?.map((skill) => (
            <span
              key={skill}
              className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-3">About the role</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        <p className="text-xs font-medium text-slate-400 mt-6">
          Posted on {formatDate(job.postedAt)}
        </p>

        {existingApp ? (
          <div className="mt-6 p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  You have already applied for this position
                </span>
                <StatusBadge status={existingApp.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Applied on {formatDate(existingApp.appliedAt)}
              </p>
            </div>
            <button
              onClick={() => navigate(`/applications/${existingApp.id}`)}
              className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors shrink-0"
            >
              View My Application &rarr;
            </button>
          </div>
        ) : (
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl px-7 py-3 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all"
          >
            Apply for this job
          </button>
        )}
      </div>
    </div>
  );
}
