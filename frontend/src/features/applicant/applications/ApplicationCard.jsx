import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../../../utils/formatDate";

export default function ApplicationCard({ application }) {
    return (
        <Link
            to={`/applications/${application.id}`}
            className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-900">{application.jobTitle}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{application.company}</p>
                </div>
                <StatusBadge status={application.status} />
            </div>

            <p className="text-xs text-slate-400 mt-3">
                Applied on {formatDate(application.appliedAt)}
            </p>
        </Link>
    );
}