import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const getRecommendation = (score) => {
  if (score >= 85) {
    return {
      label: "Strong Match",
      color: "success",
    };
  }

  if (score >= 70) {
    return {
      label: "Good Match",
      color: "info",
    };
  }

  if (score >= 55) {
    return {
      label: "Moderate Match",
      color: "warning",
    };
  }

  return {
    label: "Low Match",
    color: "error",
  };
};

const getDefaultEvaluation = (candidate) => {
  const skills = candidate?.skills || [];

  const normalizedSkills = skills.map((skill) =>
    skill.toLowerCase()
  );

  const targetSkills = [
    "react",
    "javascript",
    "html",
    "css",
    "node.js",
  ];

  const matchedSkills = targetSkills.filter((skill) =>
    normalizedSkills.includes(skill.toLowerCase())
  );

  const missingSkills = targetSkills.filter(
    (skill) =>
      !normalizedSkills.includes(skill.toLowerCase())
  );

  const skillScore =
    targetSkills.length > 0
      ? Math.round(
          (matchedSkills.length / targetSkills.length) * 100
        )
      : 0;

  const experienceText = candidate?.experience || "";

  const experienceMatch =
    experienceText.toLowerCase().includes("2") ||
    experienceText.toLowerCase().includes("3")
      ? 90
      : 75;

  const overallScore = Math.round(
    skillScore * 0.6 + experienceMatch * 0.4
  );

  const recommendation = getRecommendation(overallScore);

  return {
    overallScore,
    skillScore,
    experienceMatch,
    matchedSkills,
    missingSkills,
    recommendation: recommendation.label,
    recommendationColor: recommendation.color,
    summary: `${
      candidate?.candidate || "The candidate"
    } shows relevant technical experience and demonstrates a reasonable match with the selected role. The candidate's skills and experience should be reviewed together before making the final hiring decision.`,
  };
};

const AIEvaluationCard = ({
  candidate,
  evaluation,
  status = "success",
  errorMessage = "Unable to generate AI evaluation right now.",
  onRetry,
}) => {
  /*
   * Loading State
   */
  if (status === "loading") {
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.04), rgba(156,39,176,0.04))",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 220 }}
          >
            <CircularProgress size={42} />

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <AutoAwesomeIcon color="primary" />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Analyzing Candidate
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              AI is evaluating the candidate's skills,
              experience and role suitability.
            </Typography>

            <LinearProgress
              sx={{
                width: "100%",
                maxWidth: 420,
                height: 6,
                borderRadius: 3,
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  /*
   * Error State
   */
  if (status === "error") {
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "error.light",
          borderRadius: 3,
          backgroundColor: "error.50",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
             <WarningAmberIcon color="error" />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                AI Evaluation Failed
              </Typography>
            </Stack>

            <Alert
              severity="error"
              variant="outlined"
            >
              {errorMessage}
            </Alert>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Please try again. If the problem continues,
              the recruiter can review the candidate manually.
            </Typography>

            {onRetry && (
              <Box>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={onRetry}
                >
                  Retry Evaluation
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  /*
   * No Result State
   */
  if (status === "empty" || !candidate && !evaluation) {
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            spacing={2}
            alignItems="center"
            textAlign="center"
            sx={{ minHeight: 180 }}
            justifyContent="center"
          >
            <AutoAwesomeIcon
              color="disabled"
              sx={{ fontSize: 42 }}
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              AI Evaluation Not Available
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 500 }}
            >
              There is no AI evaluation result available
              for this candidate yet.
            </Typography>

            {onRetry && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
              >
                Generate Evaluation
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  /*
   * Success State
   */
  const result =
    evaluation || getDefaultEvaluation(candidate);

  const score = result.overallScore ?? 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.04), rgba(156,39,176,0.04))",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <AutoAwesomeIcon
                  color="primary"
                  fontSize="small"
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  AI Candidate Evaluation
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                AI-assisted analysis of candidate suitability
              </Typography>
            </Box>

            <Chip
              label={result.recommendation}
              color={result.recommendationColor}
              icon={<TrendingUpIcon />}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider />

          {/* Overall Score */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
              >
                Overall Match Score
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                color="primary"
              >
                {score}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={score}
              sx={{
                height: 10,
                borderRadius: 5,
              }}
            />
          </Box>

          {/* Score Breakdown */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Skills Match
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {result.skillScore}%
              </Typography>

              <LinearProgress
                variant="determinate"
                value={result.skillScore}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Experience Match
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {result.experienceMatch}%
              </Typography>

              <LinearProgress
                variant="determinate"
                value={result.experienceMatch}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>

          {/* Matched Skills */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Matched Skills
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {result.matchedSkills?.length > 0 ? (
                result.matchedSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No matching skills detected.
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Missing Skills */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Skills to Review
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {result.missingSkills?.length > 0 ? (
                result.missingSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No major missing skills detected.
                </Typography>
              )}
            </Stack>
          </Box>

          {/* AI Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 0.75 }}
            >
              AI Summary
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              {result.summary}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            AI evaluation is an assistive recommendation and should
            not replace recruiter review.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AIEvaluationCard;