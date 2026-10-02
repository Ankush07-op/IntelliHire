import { useState, useEffect } from "react";
import { getMyApplications } from "../features/applicant/applications/applicationsApi";
import ApplicationCard from "../features/applicant/applications/ApplicationCard";
import Loader from "../components/Loader";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">My applications</h1>
      <p className="text-sm text-slate-500 mb-6">
        {applications.length} application{applications.length !== 1 ? "s" : ""}
      </p>

      {loading && <Loader label="Loading applications..." />}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          You haven't applied to any jobs yet.
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="grid gap-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}