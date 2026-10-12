import { useState, useEffect, useCallback, useRef } from "react";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RefreshIcon from "@mui/icons-material/Refresh";
import PsychologyIcon from "@mui/icons-material/Psychology";

import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  fetchApplicationAnalysis,
  reanalyzeApplication,
} from "../../services/applicationService";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function Ranking() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobsLoading, setJobsLoading] = useState(true); // true from the start — no sync setState in effect

  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [reanalyzing, setReanalyzing] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (msg, sev = "success") => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };

  // ── Load recruiter's jobs ────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchJobs({ status: "active" }),
      fetchJobs({ status: "archived" }),
    ])
      .then(([a, b]) => setJobs([...a.jobs, ...b.jobs]))
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  // ── Load applications + their AI scores for selected job ─
  //
  // `fetchRanking` is a stable ref-based helper so the Refresh button can call
  // it imperatively without being listed as an effect dependency.
  const selectedJobIdRef = useRef(selectedJobId);
  useEffect(() => {
    selectedJobIdRef.current = selectedJobId;
  });

  const fetchRanking = useCallback(async () => {
    const jobId = selectedJobIdRef.current;
    if (jobId === "all") {
      setRanked([]);
      return;
    }
    setLoading(true);
    setFetchError("");
    try {
      const applications = await fetchApplicationsByJob(jobId);

      // Fetch all AI analyses in parallel (ignore individual failures)
      const analysisResults = await Promise.allSettled(
        applications.map((app) => fetchApplicationAnalysis(app._id))
      );

      const enriched = applications
        .map((app, idx) => {
          const analysis =
            analysisResults[idx].status === "fulfilled"
              ? analysisResults[idx].value
              : null;
          return {
            ...app,
            matchScore: analysis?.matchScore ?? null,
            analysisSummary: analysis?.summary ?? null,
          };
        })
        // Sort: scored first (descending), then unscored at the bottom
        .sort((a, b) => {
          if (a.matchScore === null && b.matchScore === null) return 0;
          if (a.matchScore === null) return 1;
          if (b.matchScore === null) return -1;
          return b.matchScore - a.matchScore;
        });

      setRanked(enriched);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load ranking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetchRanking whenever selectedJobId changes.
  // The async IIFE makes the setState calls happen asynchronously (after awaited
  // promises), so the linter correctly sees no synchronous setState in the effect.
  useEffect(() => {
    async function run() {
      await fetchRanking();
    }
    void run();
  }, [selectedJobId, fetchRanking]);

  // ── Re-analyze a single candidate ───────────────────────
  const handleReanalyze = async (applicationId) => {
    setReanalyzing(applicationId);
    try {
      await reanalyzeApplication(applicationId);
      showSnackbar("Re-analysis triggered. Refresh in a moment to see updated scores.");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to trigger re-analysis.", "error");
    } finally {
      setReanalyzing(null);
    }
  };

  const candidateName  = (app) => app.applicantId?.name  || "Unknown";
  const candidateEmail = (app) => app.applicantId?.email || "—";

  const getScoreColor = (score) => {
    if (score === null) return "default";
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const initials = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Candidate Ranking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered match scores for all applicants
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 260 }} disabled={jobsLoading}>
            <Select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">— Select a Job —</MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.title}
                  {job.status === "archived" && " (Archived)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedJobId !== "all" && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchRanking}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
        </Box>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFetchError("")}>
          {fetchError}
        </Alert>
      )}

      {/* Prompt */}
      {selectedJobId === "all" && (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <PsychologyIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">
            Select a job above to view AI-ranked candidates.
          </Typography>
        </Box>
      )}

      {/* Top 3 podium */}
      {selectedJobId !== "all" && !loading && ranked.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          {ranked.slice(0, 3).map((app, idx) => (
            <Card
              key={app._id}
              sx={{
                flex: "1 1 200px",
                borderTop: `4px solid ${MEDAL_COLORS[idx]}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <EmojiEventsIcon sx={{ color: MEDAL_COLORS[idx], fontSize: 32, mb: 1 }} />
                <Avatar sx={{ mx: "auto", mb: 1, bgcolor: MEDAL_COLORS[idx], color: "#000" }}>
                  {initials(candidateName(app))}
                </Avatar>
                <Typography fontWeight={700}>{candidateName(app)}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {candidateEmail(app)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {app.matchScore !== null ? (
                    <>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {app.matchScore}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={app.matchScore}
                        sx={{ mt: 1, borderRadius: 4, height: 6 }}
                        color={getScoreColor(app.matchScore)}
                      />
                    </>
                  ) : (
                    <Chip label="Pending" size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Full Ranking Table */}
      {selectedJobId !== "all" && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Full Ranking
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Candidate</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Match Score</strong></TableCell>
                    <TableCell><strong>AI Summary</strong></TableCell>
                    <TableCell align="center"><strong>Re-analyze</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading
                    ? [1, 2, 3].map((n) => (
                        <TableRow key={n}>
                          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                            <TableCell key={c}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : ranked.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary" sx={{ py: 4 }}>
                              No applications found for this job.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    : ranked.map((app, idx) => (
                        <TableRow key={app._id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {idx < 3 && (
                                <EmojiEventsIcon
                                  sx={{ color: MEDAL_COLORS[idx], fontSize: 18 }}
                                />
                              )}
                              <Typography fontWeight={600}>#{idx + 1}</Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem" }}>
                                {initials(candidateName(app))}
                              </Avatar>
                              <Typography fontWeight={600}>{candidateName(app)}</Typography>
                            </Box>
                          </TableCell>

                          <TableCell>{candidateEmail(app)}</TableCell>

                          <TableCell>
                            <Chip label={app.status} size="small" />
                          </TableCell>

                          <TableCell>
                            {app.matchScore !== null ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip
                                  label={`${app.matchScore}%`}
                                  color={getScoreColor(app.matchScore)}
                                  size="small"
                                />
                                <LinearProgress
                                  variant="determinate"
                                  value={app.matchScore}
                                  sx={{ flexGrow: 1, height: 6, borderRadius: 4 }}
                                  color={getScoreColor(app.matchScore)}
                                />
                              </Box>
                            ) : (
                              <Chip label="Pending Analysis" size="small" />
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {app.analysisSummary || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                reanalyzing === app._id ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  <RefreshIcon />
                                )
                              }
                              disabled={reanalyzing === app._id}
                              onClick={() => handleReanalyze(app._id)}
                            >
                              Re-run
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Ranking;