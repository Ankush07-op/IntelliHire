export const TOKEN_KEY = "ats_token";
export const USER_KEY = "ats_user";

export const APPLICATION_STATUS = {
    APPLIED: "Applied",
    SCREENING: "Screening",
    INTERVIEW: "Interview",
    OFFERED: "Offered",
    REJECTED: "Rejected",
};

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export const RESUME_RULES = {
    maxSizeMB: 5,
    maxSizeBytes: 5 * 1024 * 1024,
    acceptedTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    label: "PDF or DOCX, up to 5 MB",
};