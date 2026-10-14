import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../../../utils/formatDate";

export default function ApplicationCard({ application }) {
  const companyInitial = (application.company || "C").charAt(0).toUpperCase();

  return (
    <Link
      to={`/applications/${application.id}`}
      className="group block bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            {companyInitial}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {application.jobTitle}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {application.company}
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100 text-xs text-slate-400">
        <span>Applied on {formatDate(application.appliedAt)}</span>
        <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          View Application →
        </span>
      </div>
    </Link>
  );
}