import { formatDate } from "../../../utils/formatDate";

const PIPELINE_STEPS = ["Applied", "Shortlisted", "Interview", "Offered"];

export default function StatusTimeline({ currentStatus = "Applied", timeline = [] }) {
  const isRejected = currentStatus === "Rejected";

  const getStepIndex = (status) => {
    if (status === "Rejected") return 1; // Show rejected after applied or shortlisted
    const idx = PIPELINE_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper Bar */}
      <div className="relative py-2">
        <div className="flex items-center justify-between relative z-10">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = !isRejected && idx <= currentStepIdx;
            const isCurrent = !isRejected && idx === currentStepIdx;

            return (
              <div key={step} className="flex flex-col items-center flex-1">
                {/* Node circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-110"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    "✓"
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs mt-2 font-semibold text-center ${
                    isCurrent
                      ? "text-indigo-600"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connecting track line */}
        <div className="absolute top-6.5 left-10 right-10 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${(Math.min(currentStepIdx, 3) / (PIPELINE_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Special rejected status notice */}
      {isRejected && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-medium">
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">✕</span>
          <span>Application was not selected for this position at this time.</span>
        </div>
      )}

      {/* Detailed Timeline Log Entries */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Activity History
        </h4>
        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
          {timeline.map((step, idx) => (
            <li key={`${step.status}-${idx}`} className="ml-4">
              <div className="absolute w-2.5 h-2.5 rounded-full -left-[5px] bg-indigo-600 ring-4 ring-white" />
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-slate-800">{step.status}</span>
                <span className="text-xs text-slate-400 font-medium">{formatDate(step.date)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {step.status === "Applied" && "Application received and submitted into ATS pipeline."}
                {step.status === "Shortlisted" && "Profile matched recruiter criteria and moved to shortlist."}
                {step.status === "Interview" && "Candidate invited to technical evaluation / interview."}
                {step.status === "Offered" && "Job offer extended to candidate."}
                {step.status === "Rejected" && "Application archived."}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}