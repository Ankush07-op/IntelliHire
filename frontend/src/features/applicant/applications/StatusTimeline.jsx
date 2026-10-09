import { formatDate } from "../../../utils/formatDate";

// Props: timeline = [{ status: "Applied", date: "2026-09-24" }, ...]
export default function StatusTimeline({ timeline = [] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-slate-500">No status updates yet.</p>;
  }

  return (
    <ol className="relative border-l border-slate-200 ml-2">
      {timeline.map((step, idx) => (
        <li key={`${step.status}-${idx}`} className="mb-6 ml-4 last:mb-0">
          <div
            className={`absolute w-3 h-3 rounded-full -left-[7px] border-2 border-white ${
              idx === timeline.length - 1 ? "bg-blue-600" : "bg-slate-400"
            }`}
          />
          <p className="text-sm font-semibold text-slate-900">{step.status}</p>
          <p className="text-xs text-slate-500">{formatDate(step.date)}</p>
        </li>
      ))}
    </ol>
  );
}