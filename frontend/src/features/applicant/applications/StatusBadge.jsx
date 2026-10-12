import { APPLICATION_STATUS } from "../../../utils/constants";

const STATUS_STYLES = {
    [APPLICATION_STATUS.APPLIED]: "bg-slate-100 text-slate-700",
    [APPLICATION_STATUS.SCREENING]: "bg-amber-50 text-amber-700",
    [APPLICATION_STATUS.INTERVIEW]: "bg-blue-50 text-blue-700",
    [APPLICATION_STATUS.OFFERED]: "bg-emerald-50 text-emerald-700",
    [APPLICATION_STATUS.REJECTED]: "bg-red-50 text-red-700",
};

export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style}`}>
            {status}
        </span>
    );
}