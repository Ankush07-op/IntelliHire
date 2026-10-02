import { RESUME_RULES } from "./constants";

export function validateResumeFile(file) {
    if (!file) return "Please select a resume file.";

    if (!RESUME_RULES.acceptedTypes.includes(file.type)) {
        return "Only PDF or DOCX files are accepted.";
    }

    if (file.size > RESUME_RULES.maxSizeBytes) {
        return `File is larger than ${RESUME_RULES.maxSizeMB} MB.`;
    }

    return "";
}

export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}