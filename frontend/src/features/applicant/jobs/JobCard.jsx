import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";

export default function JobCard({ job }) {
  const companyInitial = (job.company || "C").charAt(0).toUpperCase();

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50/50 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Company Avatar Monogram */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            {companyInitial}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-700">{job.company}</span>
              <span>·</span>
              <span>{job.location}</span>
            </p>
          </div>
        </div>

        <span className="shrink-0 text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100/80">
          {job.type}
        </span>
      </div>

      <p className="text-sm text-slate-600 mt-3.5 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Skills Pills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs font-semibold text-slate-400 self-center">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400">
        <span>Posted on {formatDate(job.postedAt)}</span>
        <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          View Position →
        </span>
      </div>
    </Link>
  );
}