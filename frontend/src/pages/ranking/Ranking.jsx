import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getApplications } from "../../services/applicationStore";

const getCandidateEvaluation = (application) => {
  const skills = application?.skills || [];

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

  const skillsMatch =
    targetSkills.length > 0
      ? Math.round(
          (matchedSkills.length / targetSkills.length) * 100
        )
      : 0;

  const experienceText = application?.experience || "";

  const experienceMatch =
    experienceText.toLowerCase().includes("2") ||
    experienceText.toLowerCase().includes("3")
      ? 90
      : 75;

  const overallScore = Math.round(
    skillsMatch * 0.6 + experienceMatch * 0.4
  );

  return {
    skillsMatch,
    experienceMatch,
    overallScore,
  };
};

const getScoreColor = (score) => {
  if (score >= 85) {
    return "success";
  }

  if (score >= 70) {
    return "warning";
  }

  return "error";
};

const getStatusColor = (status) => {
  switch (status) {
    case "Shortlisted":
      return "success";
    case "Interview":
      return "info";
    case "Rejected":
      return "error";
    default:
      return "warning";
  }
};

function Ranking() {
  const [applications] = useState(() => getApplications());
  const [sortBy, setSortBy] = useState("score");

  const rankedCandidates = useMemo(() => {
    const candidates = applications.map((application) => ({
      ...application,
      evaluation: getCandidateEvaluation(application),
    }));

    return [...candidates].sort((a, b) => {
      if (sortBy === "skills") {
        return (
          b.evaluation.skillsMatch -
          a.evaluation.skillsMatch
        );
      }

      if (sortBy === "experience") {
        return (
          b.evaluation.experienceMatch -
          a.evaluation.experienceMatch
        );
      }

      return (
        b.evaluation.overallScore -
        a.evaluation.overallScore
      );
    });
  }, [applications, sortBy]);

  const rankingStats = useMemo(() => {
    if (rankedCandidates.length === 0) {
      return {
        totalCandidates: 0,
        averageScore: 0,
        strongMatches: 0,
        shortlisted: 0,
        topCandidate: null,
      };
    }

    const totalScore = rankedCandidates.reduce(
      (total, candidate) =>
        total + candidate.evaluation.overallScore,
      0
    );

    const strongMatches = rankedCandidates.filter(
      (candidate) =>
        candidate.evaluation.overallScore >= 85
    ).length;

    const shortlisted = rankedCandidates.filter(
      (candidate) =>
        candidate.status === "Shortlisted"
    ).length;

    return {
      totalCandidates: rankedCandidates.length,
      averageScore: Math.round(
        totalScore / rankedCandidates.length
      ),
      strongMatches,
      shortlisted,
      topCandidate: rankedCandidates[0],
    };
  }, [rankedCandidates]);

  return (
    <Box>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Candidate Ranking
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Compare candidates using AI-based matching
            scores and recruiter insights.
          </Typography>
        </Box>

        <Select
          size="small"
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value)
          }
          sx={{ minWidth: 210 }}
        >
          <MenuItem value="score">
            Sort by Overall Score
          </MenuItem>

          <MenuItem value="skills">
            Sort by Skills Match
          </MenuItem>

          <MenuItem value="experience">
            Sort by Experience Match
          </MenuItem>
        </Select>
      </Stack>

      {/* Ranking Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Candidates
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 0.5 }}
                >
                  {rankingStats.totalCandidates}
                </Typography>
              </Box>

              <GroupsIcon
                color="primary"
                sx={{ fontSize: 32 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Average AI Score
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 0.5 }}
                >
                  {rankingStats.averageScore}%
                </Typography>
              </Box>

              <TrendingUpIcon
                color="success"
                sx={{ fontSize: 32 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Strong Matches
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 0.5 }}
                >
                  {rankingStats.strongMatches}
                </Typography>
              </Box>

              <StarIcon
                color="warning"
                sx={{ fontSize: 32 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Shortlisted
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 0.5 }}
                >
                  {rankingStats.shortlisted}
                </Typography>
              </Box>

              <CheckCircleIcon
                color="success"
                sx={{ fontSize: 32 }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Top Candidate */}
      {rankingStats.topCandidate && (
        <Card
          sx={{
            mb: 3,
            border: "1px solid",
            borderColor: "primary.light",
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.05), rgba(156,39,176,0.04))",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={3}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "warning.light",
                  }}
                >
                  <EmojiEventsIcon
                    sx={{ fontSize: 32 }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                  >
                    Top Ranked Candidate
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {rankingStats.topCandidate.candidate}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {rankingStats.topCandidate.job}
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  minWidth: { xs: "100%", md: 180 },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.75 }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    AI Match
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary"
                  >
                    {
                      rankingStats.topCandidate
                        .evaluation.overallScore
                    }%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={
                    rankingStats.topCandidate.evaluation
                      .overallScore
                  }
                  color="success"
                  sx={{
                    height: 8,
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Recruiter Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Ranking Insights
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Average candidate score
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {rankingStats.averageScore}%
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Based on the current candidate pool.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Strong match rate
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {rankingStats.totalCandidates > 0
                  ? Math.round(
                      (rankingStats.strongMatches /
                        rankingStats.totalCandidates) *
                        100
                    )
                  : 0}
                %
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Candidates scoring 85% or higher.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Shortlist coverage
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {rankingStats.totalCandidates > 0
                  ? Math.round(
                      (rankingStats.shortlisted /
                        rankingStats.totalCandidates) *
                        100
                    )
                  : 0}
                %
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Candidates currently shortlisted.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={600}>
              Ranked Candidates
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Candidates are ordered by their calculated
              match score.
            </Typography>
          </Box>

          <Divider />

          {rankedCandidates.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
              >
                No candidates available
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Candidate applications will appear here.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Rank
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Candidate
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Applied Job
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      AI Match
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Skills
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Experience
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rankedCandidates.map(
                    (candidate, index) => {
                      const {
                        overallScore,
                        skillsMatch,
                        experienceMatch,
                      } = candidate.evaluation;

                      return (
                        <TableRow
                          key={candidate.id}
                          hover
                        >
                          <TableCell>
                            <Typography fontWeight={700}>
                              #{index + 1}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {candidate.candidate}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {candidate.email}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {candidate.job}
                          </TableCell>

                          <TableCell sx={{ minWidth: 150 }}>
                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                >
                                  {overallScore}%
                                </Typography>

                                <Chip
                                  size="small"
                                  label={
                                    overallScore >= 85
                                      ? "Strong"
                                      : overallScore >= 70
                                        ? "Good"
                                        : "Low"
                                  }
                                  color={getScoreColor(
                                    overallScore
                                  )}
                                />
                              </Stack>

                              <LinearProgress
                                variant="determinate"
                                value={overallScore}
                                color={getScoreColor(
                                  overallScore
                                )}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                }}
                              />
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {skillsMatch}%
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {experienceMatch}%
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={candidate.status}
                              color={getStatusColor(
                                candidate.status
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Ranking;