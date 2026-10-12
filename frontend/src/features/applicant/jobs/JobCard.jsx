import { Link } from "react-router-dom";

export default function JobCard({ job }) {
    return (
        <Link
            to={`/jobs/${job.id}`}
            className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {job.company} · {job.location}
                    </p>
                </div>
                <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {job.type}
                </span>
            </div>

            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.map((skill) => (
                    <span
                        key={skill}
                        className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </Link>
    );
}