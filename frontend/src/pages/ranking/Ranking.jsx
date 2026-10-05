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
import { getApplications } from "../../services/applicationStore";

const getCandidateEvaluation = (application) => {
  const skillCount = application.skills?.length || 0;

  const skillsMatch =
    skillCount >= 4 ? 90 : skillCount === 3 ? 82 : skillCount === 2 ? 74 : 65;

  const experienceText = application.experience || "";
  const experienceValue = parseFloat(experienceText) || 0;

  const experienceMatch =
    experienceValue >= 3
      ? 92
      : experienceValue >= 2.5
        ? 88
        : experienceValue >= 2
          ? 84
          : experienceValue >= 1.5
            ? 78
            : 70;

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

  return (
    <Box>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
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
            Compare candidates using AI-based matching scores.
          </Typography>
        </Box>

        <Select
          size="small"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          sx={{ minWidth: 190 }}
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

      {/* Summary Cards */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Candidates
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {rankedCandidates.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Top Match
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {rankedCandidates[0]
                ? `${rankedCandidates[0].evaluation.overallScore}%`
                : "--"}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Shortlisted
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {
                rankedCandidates.filter(
                  (candidate) =>
                    candidate.status === "Shortlisted"
                ).length
              }
            </Typography>
          </CardContent>
        </Card>
      </Stack>

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
              Candidates are ordered by their calculated match score.
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
                            <Typography
                              fontWeight={700}
                            >
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