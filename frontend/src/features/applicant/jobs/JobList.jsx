import JobCard from "./JobCard";
import Loader from "../../../components/Loader";

export default function JobList({ jobs, loading, error }) {
    if (loading) return <Loader label="Loading jobs..." />;

    if (error) {
        return (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 text-sm">
                No jobs match your search. Try adjusting the filters.
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}