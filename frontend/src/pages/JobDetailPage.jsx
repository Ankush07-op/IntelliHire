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
    <div className="max-w-2xl mx-auto">
      <Link to="/jobs" className="text-sm text-blue-700 font-medium">
        ← Back to job board
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {job.company} · {job.location}
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            {job.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-slate-900 mt-6 mb-2">About the role</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>

        <p className="text-xs text-slate-400 mt-6">
          Posted on {formatDate(job.postedAt)}
        </p>

        {existingApp ? (
          <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              className="w-full sm:w-auto text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            >
              View My Application →
            </button>
          </div>
        ) : (
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto mt-6 bg-blue-600 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-blue-700 transition-colors"
          >
            Apply for this job
          </button>
        )}
      </div>
    </div>
  );
}
