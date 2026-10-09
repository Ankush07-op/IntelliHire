import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getJobById } from "../features/applicant/jobs/jobsApi";
import { useAuth } from "../features/applicant/auth/AuthContext";
import Loader from "../components/Loader";
import { formatDate } from "../utils/formatDate";


export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getJobById(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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

        <button
          onClick={handleApplyClick}
          className="w-full sm:w-auto mt-6 bg-blue-600 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-blue-700"
        >
          Apply for this job
        </button>
      </div>
    </div>
  );
}
