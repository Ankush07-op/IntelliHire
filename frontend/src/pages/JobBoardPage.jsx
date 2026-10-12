import { useState, useEffect } from "react";
import { getJobs } from "../features/applicant/jobs/jobsApi";
import JobList from "../features/applicant/jobs/JobList";
import JobSearchBar from "../features/applicant/jobs/JobSearchBar";
import JobFilters from "../features/applicant/jobs/JobFilters";

export default function JobBoardPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Debounce so we don't refetch on every keystroke
    const timer = setTimeout(() => {
      getJobs({ search, location, type })
        .then(setJobs)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, location, type]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Find your next role</h1>
      <p className="text-sm text-slate-500 mb-6">{jobs.length} open positions</p>

      <div className="flex flex-col gap-3 mb-6">
        <JobSearchBar value={search} onChange={setSearch} />
        <JobFilters
          location={location}
          type={type}
          onLocationChange={setLocation}
          onTypeChange={setType}
        />
      </div>

      <JobList jobs={jobs} loading={loading} error={error} />
    </div>
  );
}

