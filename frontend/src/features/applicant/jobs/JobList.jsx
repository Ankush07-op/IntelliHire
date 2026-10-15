import JobCard from "./JobCard";

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 w-full">
          <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
          <div className="w-full">
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
        <div className="w-16 h-6 bg-slate-200 rounded-full shrink-0" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-full mt-4" />
      <div className="h-4 bg-slate-100 rounded w-2/3 mt-2" />
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-slate-100 rounded w-16" />
        <div className="h-6 bg-slate-100 rounded w-20" />
        <div className="h-6 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function JobList({ jobs, loading, error, onResetFilters }) {
  if (loading) {
    return (
      <div className="grid gap-3.5">
        {[1, 2, 3, 4].map((n) => (
          <JobCardSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4">
        <p className="font-semibold">Unable to load job postings</p>
        <p className="text-xs mt-1 text-rose-600">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-2xl">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
          🔍
        </div>
        <h3 className="text-base font-bold text-slate-900">No matching positions found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          We couldn't find any openings matching your search criteria. Try modifying your keywords or location.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
          >
            Clear Search Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}