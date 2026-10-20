import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { useToast } from "../../context/ToastContext";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RefreshIcon from "@mui/icons-material/Refresh";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import { useAuth } from "../../context/useAuth";
import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  fetchJobRankings,
  reanalyzeApplication,
} from "../../services/applicationService";
import { formatDate } from "../../utils/formatDate";
import { clampScore, getMatchCategory, getScoreColor } from "../../utils/scoreUtils";
import AIMatchProgressBar from "../../components/ai/AIMatchProgressBar";

const MEDAL_COLORS = ["#F59E0B", "#94A3B8", "#D97706"];

function Ranking() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobsLoading, setJobsLoading] = useState(true);

  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [reanalyzing, setReanalyzing] = useState(null);
  const { showToast } = useToast();

  // Filters & Sorting state
  const [candidateSearch, setCandidateSearch] = useState("");
  const [sortBy, setSortBy] = useState("score"); // 'score' | 'skills' | 'experience'
  const [scoreFilter, setScoreFilter] = useState("all"); // 'all' | 'strong' | 'medium' | 'weak'
  const [skillFilter, setSkillFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all"); // 'all' | '1plus' | '2plus' | '3plus' | '5plus'

  // Modal inspection state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const showSnackbar = useCallback((msg, sev = "success") => {
    showToast(msg, sev);
  }, [showToast]);

  // ── Load recruiter's jobs ────────────────────────────────
  useEffect(() => {
    let active = true;
    const recruiterId = user?._id || user?.id;
    const params = recruiterId ? { recruiterId } : {};

    Promise.all([
      fetchJobs({ ...params, status: "active" }),
      fetchJobs({ ...params, status: "archived" }),
    ])
      .then(([a, b]) => {
        if (active) {
          const combined = [
            ...(Array.isArray(a?.jobs) ? a.jobs : []),
            ...(Array.isArray(b?.jobs) ? b.jobs : []),
          ];
          setJobs(combined);
          setJobsLoading(false);
        }
      })
      .catch(() => {
        if (active) setJobsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  // ── Load applications + their AI scores for selected job ─
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
      // Parallel fetch: get indexed ranking aggregation & complete application records
      const [rankingData, applications] = await Promise.all([
        fetchJobRankings(jobId).catch(() => ({ rankings: [] })),
        fetchApplicationsByJob(jobId),
      ]);

      const rankedMap = new Map();
      (rankingData.rankings || []).forEach((r) => {
        const appId = r.applicationId?._id?.toString() || r.applicationId?.toString();
        if (appId) {
          rankedMap.set(appId, r);
        }
      });

      const enriched = (Array.isArray(applications) ? applications : [])
        .map((app) => {
          const analysis = rankedMap.get(app._id?.toString());
          return {
            ...app,
            matchScore: analysis ? (analysis.score ?? analysis.matchScore ?? null) : null,
            experienceYears: analysis?.experienceYears ?? null,
            matchedSkills: analysis?.matchedSkills ?? [],
            missingSkills: analysis?.missingSkills ?? [],
            analysisSummary: analysis?.summary ?? null,
          };
        })
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

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // ── Dynamic Skills available for the selected job & applicants ──
  const availableSkills = useMemo(() => {
    const set = new Set();
    if (Array.isArray(selectedJob?.requiredSkills)) {
      selectedJob.requiredSkills.forEach((s) => {
        const trimmed = typeof s === "string" ? s.trim() : "";
        if (trimmed) set.add(trimmed);
      });
    }
    ranked.forEach((app) => {
      if (Array.isArray(app.matchedSkills)) {
        app.matchedSkills.forEach((s) => {
          const trimmed = typeof s === "string" ? s.trim() : "";
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [selectedJob, ranked]);

  // ── Filtered candidates ──────────────────────────────────
  const filteredRanked = useMemo(() => {
    return ranked.filter((app) => {
      // Score filter: Strong ≥80%, Medium 60-79%, Weak <60%
      if (scoreFilter === "strong" && (app.matchScore === null || app.matchScore < 80)) return false;
      if (scoreFilter === "medium" && (app.matchScore === null || app.matchScore < 60 || app.matchScore >= 80)) return false;
      if (scoreFilter === "weak" && (app.matchScore === null || app.matchScore >= 60)) return false;

      // Skill filter
      if (skillFilter !== "all") {
        const target = skillFilter.toLowerCase();
        const hasSkill = (app.matchedSkills || []).some(
          (s) => typeof s === "string" && s.toLowerCase().includes(target)
        );
        if (!hasSkill) return false;
      }

      // Experience filter
      if (experienceFilter === "1plus" && (app.experienceYears ?? 0) < 1) return false;
      if (experienceFilter === "2plus" && (app.experienceYears ?? 0) < 2) return false;
      if (experienceFilter === "3plus" && (app.experienceYears ?? 0) < 3) return false;
      if (experienceFilter === "5plus" && (app.experienceYears ?? 0) < 5) return false;

      // Text query
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        const name = (app.applicantId?.name || "").toLowerCase();
        const email = (app.applicantId?.email || "").toLowerCase();
        const skills = (app.matchedSkills || []).join(" ").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !skills.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [ranked, scoreFilter, skillFilter, experienceFilter, candidateSearch]);

  // ── Sorted candidates ────────────────────────────────────
  const sortedRanked = useMemo(() => {
    const list = [...filteredRanked];
    list.sort((a, b) => {
      if (sortBy === "skills") {
        const countA = a.matchedSkills?.length || 0;
        const countB = b.matchedSkills?.length || 0;
        if (countB !== countA) return countB - countA;
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      }
      if (sortBy === "experience") {
        const expA = a.experienceYears ?? 0;
        const expB = b.experienceYears ?? 0;
        if (expB !== expA) return expB - expA;
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      }
      // Default: 'score'
      if (a.matchScore === null && b.matchScore === null) return 0;
      if (a.matchScore === null) return 1;
      if (b.matchScore === null) return -1;
      return b.matchScore - a.matchScore;
    });
    return list;
  }, [filteredRanked, sortBy]);

  const isFilterActive =
    sortBy !== "score" ||
    scoreFilter !== "all" ||
    skillFilter !== "all" ||
    experienceFilter !== "all" ||
    candidateSearch.trim() !== "";

  const handleResetFilters = () => {
    setSortBy("score");
    setScoreFilter("all");
    setSkillFilter("all");
    setExperienceFilter("all");
    setCandidateSearch("");
  };

  // ── Export CSV Superpower ───────────────────────────────
  const handleExportCSV = () => {
    if (sortedRanked.length === 0) return;
    const currentJob = jobs.find((j) => j._id === selectedJobId);
    const headers = [
      "Rank",
      "Candidate Name",
      "Email",
      "Match Score (%)",
      "Match Category",
      "Experience (Years)",
      "Matched Skills",
      "Missing Skills",
      "Pipeline Status",
      "Applied Date",
    ];
    const rows = sortedRanked.map((app, idx) => [
      `#${idx + 1}`,
      `"${(app.applicantId?.name || "Unknown").replace(/"/g, '""')}"`,
      `"${(app.applicantId?.email || "").replace(/"/g, '""')}"`,
      app.matchScore !== null ? `${clampScore(app.matchScore)}%` : "Pending",
      getMatchCategory(app.matchScore).label,
      app.experienceYears ?? "N/A",
      `"${(app.matchedSkills || []).join(", ").replace(/"/g, '""')}"`,
      `"${(app.missingSkills || []).join(", ").replace(/"/g, '""')}"`,
      app.status,
      formatDate(app.createdAt),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `IntelliHire_Rankings_${(currentJob?.title || "Job").replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("CSV ranking export downloaded successfully.");
  };

  const candidateName = (app) => app.applicantId?.name || "Unknown Candidate";
  const candidateEmail = (app) => app.applicantId?.email || "—";

  const initials = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const top3 = ranked.slice(0, 3);

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Dedicated Page Header Row ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em" }}>
            Candidate Rankings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Compare candidates using AI-based matching scores and recruiter insights.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {selectedJobId !== "all" && ranked.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ fontWeight: 600, height: 38 }}
            >
              Export CSV
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            disabled={selectedJobId === "all" || loading}
            onClick={fetchRanking}
            sx={{ fontWeight: 600, height: 38 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* ── Dedicated Responsive Filter Controls Row ── */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Grid container spacing={2} alignItems="center">
            {/* 1. Job Opening Selector */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={jobsLoading}>
                <InputLabel id="ranking-job-select-label">Job Opening</InputLabel>
                <Select
                  labelId="ranking-job-select-label"
                  id="ranking-job-select"
                  value={selectedJobId}
                  label="Job Opening"
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  <MenuItem value="all">— Select an Opening —</MenuItem>
                  {jobs.map((job) => (
                    <MenuItem key={job._id} value={job._id}>
                      {job.title}
                      {job.status === "archived" && " (Archived)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 2. Sort By */}
            <Grid item xs={12} sm={6} md={2.25}>
              <FormControl fullWidth size="small" disabled={selectedJobId === "all"}>
                <InputLabel id="ranking-sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="ranking-sort-select-label"
                  id="ranking-sort-select"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="score">Overall Score</MenuItem>
                  <MenuItem value="skills">Skills Match</MenuItem>
                  <MenuItem value="experience">Experience Match</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 3. Score Category Filter */}
            <Grid item xs={12} sm={6} md={2.25}>
              <FormControl fullWidth size="small" disabled={selectedJobId === "all"}>
                <InputLabel id="ranking-score-select-label">Match Category</InputLabel>
                <Select
                  labelId="ranking-score-select-label"
                  id="ranking-score-select"
                  value={scoreFilter}
                  label="Match Category"
                  onChange={(e) => setScoreFilter(e.target.value)}
                >
                  <MenuItem value="all">All Scores</MenuItem>
                  <MenuItem value="strong">Strong (≥80%)</MenuItem>
                  <MenuItem value="medium">Medium (60–79%)</MenuItem>
                  <MenuItem value="weak">Weak (&lt;60%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 4. Skills Filter */}
            <Grid item xs={12} sm={6} md={2.25}>
              <FormControl fullWidth size="small" disabled={selectedJobId === "all"}>
                <InputLabel id="ranking-skill-select-label">Skill</InputLabel>
                <Select
                  labelId="ranking-skill-select-label"
                  id="ranking-skill-select"
                  value={skillFilter}
                  label="Skill"
                  onChange={(e) => setSkillFilter(e.target.value)}
                >
                  <MenuItem value="all">All Skills</MenuItem>
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 5. Experience Filter */}
            <Grid item xs={12} sm={6} md={2.25}>
              <FormControl fullWidth size="small" disabled={selectedJobId === "all"}>
                <InputLabel id="ranking-exp-select-label">Experience</InputLabel>
                <Select
                  labelId="ranking-exp-select-label"
                  id="ranking-exp-select"
                  value={experienceFilter}
                  label="Experience"
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <MenuItem value="all">All Experience</MenuItem>
                  <MenuItem value="1plus">1+ Years</MenuItem>
                  <MenuItem value="2plus">2+ Years</MenuItem>
                  <MenuItem value="3plus">3+ Years</MenuItem>
                  <MenuItem value="5plus">5+ Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Sub-row for Keyword Search and Filter Reset */}
          {selectedJobId !== "all" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mt: 2,
                pt: 2,
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <OutlinedInput
                size="small"
                placeholder="Search candidate name, email, or skill..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ minWidth: { xs: "100%", sm: 320 }, height: 38 }}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Showing <strong>{sortedRanked.length}</strong> of {ranked.length} candidates
                </Typography>
                {isFilterActive && (
                  <Tooltip title="Reset all search and filter controls">
                    <Button
                      size="small"
                      color="inherit"
                      variant="text"
                      startIcon={<FilterListOffIcon fontSize="small" />}
                      onClick={handleResetFilters}
                      sx={{ textTransform: "none", fontSize: "0.8rem", color: "text.secondary" }}
                    >
                      Clear Filters
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFetchError("")}>
          {fetchError}
        </Alert>
      )}

      {/* Prompt when no job selected */}
      {selectedJobId === "all" && !jobsLoading && (
        <Box
          sx={{
            py: 12,
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px dashed #CBD5E1",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="text.primary">
            No Job Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select an active job opening above to view its ranked candidate leaderboard.
          </Typography>
        </Box>
      )}

      {/* ── Top 3 Candidate Podium ── */}
      {selectedJobId !== "all" && !loading && top3.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <EmojiEventsIcon sx={{ color: "#F59E0B", fontSize: 24 }} />
            <Typography variant="h6" fontWeight={800}>
              Top Candidate Podium
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {top3.map((app, idx) => {
              const medalColor = MEDAL_COLORS[idx] || "#64748B";
              const name = candidateName(app);

              return (
                <Grid item xs={12} sm={4} key={app._id}>
                  <Card
                    onClick={() => {
                      setSelectedCandidate(app);
                      setDetailModalOpen(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "16px",
                      border: `1.5px solid ${idx === 0 ? "#FDE68A" : "#E2E8F0"}`,
                      backgroundColor: idx === 0 ? "#FFFDF5" : "#FFFFFF",
                      boxShadow: idx === 0 ? "0 8px 24px -4px rgba(245, 158, 11, 0.15)" : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              backgroundColor: medalColor,
                              color: "#FFF",
                            }}
                          >
                            #{idx + 1}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {idx === 0 ? "Top Rank" : idx === 1 ? "Runner-Up" : "Third Place"}
                          </Typography>
                        </Box>

                        <Chip
                          label={
                            app.matchScore !== null
                              ? `${clampScore(app.matchScore)}% · ${getMatchCategory(app.matchScore).label}`
                              : "Pending"
                          }
                          color={getScoreColor(app.matchScore)}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={800} noWrap sx={{ color: "#0F172A" }}>
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                        {candidateEmail(app)}
                      </Typography>

                      {/* AI Match Score Progress Bar */}
                      <AIMatchProgressBar
                        score={app.matchScore}
                        label="AI Match Score"
                        showLabel={true}
                        showCategory={false}
                        height={6}
                        sx={{ mb: 2 }}
                      />

                      {/* Matched Skills Chips */}
                      {app.matchedSkills?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {app.matchedSkills.slice(0, 3).map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              size="small"
                              sx={{
                                fontSize: "0.68rem",
                                height: 20,
                                backgroundColor: "#ECFDF5",
                                color: "#059669",
                                fontWeight: 700,
                              }}
                            />
                          ))}
                          {app.matchedSkills.length > 3 && (
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", ml: 0.5 }}>
                              +{app.matchedSkills.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* ── Leaderboard Table Card ── */}
      {selectedJobId !== "all" && (
        <Card sx={{ borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          <CardContent sx={{ p: 3 }}>
            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                    <TableCell sx={{ width: 80 }}><strong>Rank</strong></TableCell>
                    <TableCell><strong>Candidate</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell sx={{ minWidth: 180 }}><strong>AI Match Score</strong></TableCell>
                    <TableCell><strong>Experience</strong></TableCell>
                    <TableCell align="center"><strong>AI Breakdown</strong></TableCell>
                    <TableCell align="center"><strong>Re-analyze</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading
                    ? [1, 2, 3, 4].map((n) => (
                        <TableRow key={n}>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                            <TableCell key={c}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : sortedRanked.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary" sx={{ py: 6 }}>
                              No candidates match your current filter settings.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    : sortedRanked.map((app, idx) => (
                        <TableRow key={app._id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {idx < 3 && scoreFilter === "all" && !candidateSearch && (
                                <EmojiEventsIcon sx={{ color: MEDAL_COLORS[idx], fontSize: 18 }} />
                              )}
                              <Typography fontWeight={700}>#{idx + 1}</Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", fontWeight: 700, bgcolor: "#EEF2FF", color: "#4F46E5" }}>
                                {initials(candidateName(app))}
                              </Avatar>
                              <Typography fontWeight={700} sx={{ color: "#0F172A" }}>
                                {candidateName(app)}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ color: "text.secondary" }}>{candidateEmail(app)}</TableCell>

                          <TableCell>
                            <Chip label={app.status} size="small" sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                          </TableCell>

                          <TableCell sx={{ minWidth: 180 }}>
                            <AIMatchProgressBar
                              score={app.matchScore}
                              compact={true}
                              showCategory={true}
                              height={6}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {app.experienceYears !== null ? `${app.experienceYears} yrs` : "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                setSelectedCandidate(app);
                                setDetailModalOpen(true);
                              }}
                              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              Inspect →
                            </Button>
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                reanalyzing === app._id ? (
                                  <CircularProgress size={12} color="inherit" />
                                ) : (
                                  <RefreshIcon sx={{ fontSize: 14 }} />
                                )
                              }
                              disabled={reanalyzing === app._id}
                              onClick={() => handleReanalyze(app._id)}
                              sx={{ fontSize: "0.72rem", py: 0.4 }}
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

      {/* ── Candidate Skill Comparison & AI Breakdown Modal ── */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {candidateName(selectedCandidate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {candidateEmail(selectedCandidate)} · Applied for {selectedJob?.title}
                  </Typography>
                </Box>
                <Chip
                  label={
                    selectedCandidate.matchScore !== null
                      ? `${clampScore(selectedCandidate.matchScore)}% · ${getMatchCategory(selectedCandidate.matchScore).label}`
                      : "Pending"
                  }
                  color={getScoreColor(selectedCandidate.matchScore)}
                  sx={{ fontWeight: 800, fontSize: "0.85rem", px: 1 }}
                />
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Full-width Standardized AI Match Score Progress Bar */}
              <Box sx={{ mb: 3, p: 2, bgcolor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <AIMatchProgressBar
                  score={selectedCandidate.matchScore}
                  label="Overall Candidate AI Match Score"
                  showLabel={true}
                  showCategory={true}
                  height={8}
                />
              </Box>

              {/* AI Summary Box */}
              <Box sx={{ mb: 3, p: 2.5, bgcolor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <PsychologyIcon sx={{ color: "#4F46E5", fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    AI Evaluation Summary
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.6 }}>
                  {selectedCandidate.analysisSummary ||
                    "This candidate's resume has been parsed against the required job description."}
                </Typography>
              </Box>

              {/* Matched vs Missing Skills Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "#ECFDF5", borderRadius: "12px", border: "1px solid #A7F3D0", height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <CheckCircleIcon sx={{ color: "#059669", fontSize: 18 }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#065F46" }}>
                        Matched Skills ({selectedCandidate.matchedSkills?.length || 0})
                      </Typography>
                    </Box>
                    {selectedCandidate.matchedSkills?.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No direct matching skills recorded.
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        {selectedCandidate.matchedSkills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: "#FFFFFF",
                              color: "#059669",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              border: "1px solid #6EE7B7",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "#FEF2F2", borderRadius: "12px", border: "1px solid #FECACA", height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <CancelIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#991B1B" }}>
                        Missing / Gap Skills ({selectedCandidate.missingSkills?.length || 0})
                      </Typography>
                    </Box>
                    {selectedCandidate.missingSkills?.length === 0 ? (
                      <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600 }}>
                        All primary job skills met!
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        {selectedCandidate.missingSkills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: "#FFFFFF",
                              color: "#DC2626",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              border: "1px solid #FCA5A5",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Experience Metadata */}
              <Box sx={{ mt: 3, display: "flex", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Relevant Experience
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {selectedCandidate.experienceYears !== null ? `${selectedCandidate.experienceYears} Years` : "Not specified"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Current Status
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {selectedCandidate.status}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Ranking;