/**
 * IntelliHire Standard AI Candidate Match Thresholds & Helpers
 *
 * Requirements:
 * 1. Strong = 80% and above
 * 2. Medium = 60% to 79%
 * 3. Weak = below 60%
 */

export const MATCH_THRESHOLDS = {
  STRONG: 80,
  MEDIUM: 60,
};

/**
 * Safely clamps a score to the 0-100 integer range.
 * Returns null for missing, null, undefined, or NaN inputs.
 */
export const clampScore = (score) => {
  if (score === null || score === undefined || score === "") return null;
  const num = Number(score);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(100, Math.round(num)));
};

/**
 * Returns standard match category metadata:
 * - Strong: >= 80% (success)
 * - Medium: 60-79% (warning)
 * - Weak: < 60% (error)
 * - Pending: missing/invalid (default)
 */
export const getMatchCategory = (score) => {
  const clamped = clampScore(score);

  if (clamped === null) {
    return {
      key: "pending",
      label: "Pending",
      fullLabel: "Pending Analysis",
      color: "default",
      badgeColor: "#64748B",
      badgeBg: "#F1F5F9",
      badgeBorder: "#CBD5E1",
    };
  }

  if (clamped >= MATCH_THRESHOLDS.STRONG) {
    return {
      key: "strong",
      label: "Strong",
      fullLabel: "Strong Match",
      color: "success",
      badgeColor: "#059669",
      badgeBg: "#ECFDF5",
      badgeBorder: "#A7F3D0",
    };
  }

  if (clamped >= MATCH_THRESHOLDS.MEDIUM) {
    return {
      key: "medium",
      label: "Medium",
      fullLabel: "Medium Match",
      color: "warning",
      badgeColor: "#D97706",
      badgeBg: "#FFFBEB",
      badgeBorder: "#FDE68A",
    };
  }

  return {
    key: "weak",
    label: "Weak",
    fullLabel: "Weak Match",
    color: "error",
    badgeColor: "#DC2626",
    badgeBg: "#FEF2F2",
    badgeBorder: "#FECACA",
  };
};

/**
 * Returns the MUI color key ('success' | 'warning' | 'error' | 'default')
 */
export const getScoreColor = (score) => {
  return getMatchCategory(score).color;
};

/**
 * Formats score for display (e.g., '84%' or 'Pending')
 */
export const formatScore = (score) => {
  const clamped = clampScore(score);
  return clamped !== null ? `${clamped}%` : "Pending";
};

/**
 * Enriches an array of Application documents with AI analysis ranking records.
 */
export const enrichApplicationsWithRankings = (applications, rankingData) => {
  const rankedMap = new Map();
  (rankingData?.rankings || []).forEach((r) => {
    const appId = r.applicationId?._id?.toString() || r.applicationId?.toString();
    if (appId) {
      rankedMap.set(appId, r);
    }
  });

  return (Array.isArray(applications) ? applications : []).map((app) => {
    const analysis = rankedMap.get(app._id?.toString());
    return {
      ...app,
      matchScore: analysis ? clampScore(analysis.score ?? analysis.matchScore) : null,
      experienceYears: analysis?.experienceYears ?? null,
      matchedSkills: analysis?.matchedSkills ?? [],
      missingSkills: analysis?.missingSkills ?? [],
      analysisSummary: analysis?.summary ?? null,
    };
  });
};
