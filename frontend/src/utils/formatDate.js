// Formats a date string like "2026-09-24" as "24 Sep 2026".
// Returns an empty string for missing or invalid values, so the UI never shows "Invalid Date".
export function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}