import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById } from "../features/applicant/jobs/jobsApi";
import ApplyForm from "../features/applicant/applications/ApplyForm";
import Loader from "../components/Loader";

export default function ApplyPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getJobById(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
    <div className="max-w-xl mx-auto">
      <ApplyForm job={job} />
    </div>
  );
}