import { RESUME_RULES } from "../../../utils/constants";
import { validateResumeFile, formatBytes } from "../../../utils/fileValidation";

// Props: value (File|null), onChange (File|null)=>void, error (string)
export default function ResumeUploader({ value, onChange, error }) {
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validationError = validateResumeFile(file);
        if (validationError) {
            onChange(null, validationError);
            e.target.value = "";
            return;
        }

        onChange(file, "");
    };

    const handleRemove = () => {
        onChange(null, "");
    };

    if (value) {
        return (
            <div>
                <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-4 py-3 bg-white">
                    <span className="text-xl">📄</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{value.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(value.size)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-sm text-slate-500 hover:text-red-600 font-medium"
                    >
                        Remove
                    </button>
                </div>
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <label
                className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer hover:bg-slate-50 ${error ? "border-red-300" : "border-slate-300"
                    }`}
            >
                <span className="text-2xl">⬆️</span>
                <span className="text-sm font-medium text-slate-700">Click to upload your resume</span>
                <span className="text-xs text-slate-500">{RESUME_RULES.label}</span>
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </label>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}