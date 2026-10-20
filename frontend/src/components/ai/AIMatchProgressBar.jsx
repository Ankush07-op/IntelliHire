import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import { clampScore, getMatchCategory } from "../../utils/scoreUtils";

/**
 * Standardized AI Match Score Progress Indicator.
 *
 * @param {number|null|undefined} props.score - Candidate AI match score (0-100)
 * @param {string} [props.label="AI Match Score"] - Text label for the progress indicator
 * @param {boolean} [props.showLabel=true] - Whether to render the label above/beside the bar
 * @param {boolean} [props.showCategory=true] - Whether to render the Strong / Medium / Weak chip
 * @param {boolean} [props.compact=false] - Inline compact layout for table cells & cards
 * @param {number} [props.height=6] - Height of the progress bar in pixels
 * @param {object} [props.sx] - Custom styling overrides for container
 */
export default function AIMatchProgressBar({
  score,
  label = "AI Match Score",
  showLabel = true,
  showCategory = true,
  compact = false,
  height = 6,
  sx = {},
}) {
  const clamped = clampScore(score);
  const category = getMatchCategory(clamped);
  const isPending = clamped === null;

  const accessibleText = isPending
    ? `${label}: Pending analysis`
    : `${label}: ${clamped} percent, categorized as ${category.label} match`;

  // ── Inline Compact Mode (for table rows, compact cards) ─────────────
  if (compact) {
    if (isPending) {
      return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, ...sx }}>
          <Chip
            label="Pending Analysis"
            size="small"
            sx={{
              backgroundColor: category.badgeBg,
              color: category.badgeColor,
              border: `1px solid ${category.badgeBorder}`,
              fontWeight: 600,
              fontSize: "0.72rem",
              height: 22,
            }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 160,
          ...sx,
        }}
        title={accessibleText}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            minWidth: 42,
            color: category.badgeColor,
            fontSize: "0.8rem",
          }}
        >
          {clamped}%
        </Typography>

        <Box sx={{ flexGrow: 1, minWidth: 60 }}>
          <LinearProgress
            variant="determinate"
            value={clamped}
            color={category.color}
            sx={{
              height,
              borderRadius: height / 2,
              backgroundColor: "#E2E8F0",
            }}
            aria-label={label}
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={accessibleText}
          />
        </Box>

        {showCategory && (
          <Chip
            label={category.label}
            size="small"
            color={category.color}
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 20,
              px: 0.5,
            }}
          />
        )}
      </Box>
    );
  }

  // ── Full-Width / Standard Mode (for drawers, cards, podium) ─────────
  return (
    <Box sx={{ width: "100%", ...sx }}>
      {showLabel && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.75,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {label}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={800}
              sx={{ color: isPending ? "text.secondary" : category.badgeColor }}
            >
              {isPending ? "Pending" : `${clamped}%`}
            </Typography>

            {showCategory && (
              <Chip
                label={category.label}
                size="small"
                color={category.color}
                sx={{
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  height: 22,
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {isPending ? (
        <LinearProgress
          variant="determinate"
          value={0}
          sx={{
            height,
            borderRadius: height / 2,
            backgroundColor: "#F1F5F9",
          }}
          aria-label={`${label}: Pending analysis`}
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext="Pending analysis"
        />
      ) : (
        <LinearProgress
          variant="determinate"
          value={clamped}
          color={category.color}
          sx={{
            height,
            borderRadius: height / 2,
            backgroundColor: "#F1F5F9",
          }}
          aria-label={label}
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={accessibleText}
        />
      )}
    </Box>
  );
}
