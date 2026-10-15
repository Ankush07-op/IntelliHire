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

    // Debounce search keystrokes
    const timer = setTimeout(() => {
      getJobs({ search, location, type })
        .then(setJobs)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, location, type]);

  const handleResetFilters = () => {
    setSearch("");
    setLocation("");
    setType("");
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Live Talent Opportunities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find your next breakthrough role
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Discover positions tailored to your skill profile with instant AI match feedback.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-xs space-y-3.5">
        <JobSearchBar value={search} onChange={setSearch} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <JobFilters
            location={location}
            type={type}
            onLocationChange={setLocation}
            onTypeChange={setType}
          />
          <div className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            {!loading && `${jobs.length} open position${jobs.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      {/* Job Postings Stream */}
      <JobList
        jobs={jobs}
        loading={loading}
        error={error}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
