import { useState, useEffect, useMemo, useCallback } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import { useToast } from "../../context/ToastContext";

import SearchIcon from "@mui/icons-material/Search";

import { useAuth } from "../../context/useAuth";
import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  fetchJobRankings,
  updateApplicationStatus,
} from "../../services/applicationService";
import { formatDate } from "../../utils/formatDate";
import { enrichApplicationsWithRankings } from "../../utils/scoreUtils";
import AIMatchProgressBar from "../../components/ai/AIMatchProgressBar";

// Pipeline columns — must match backend enum exactly
const COLUMNS = [
  { id: "Applied",     title: "Applied",     color: "warning", hex: "#F59E0B", bg: "#FFFBEB" },
  { id: "Shortlisted", title: "Shortlisted", color: "secondary", hex: "#6366F1", bg: "#EEF2FF" },
  { id: "Interview",   title: "Interview",   color: "info",    hex: "#0EA5E9", bg: "#F0F9FF" },
  { id: "Offered",     title: "Offered",     color: "success", hex: "#10B981", bg: "#ECFDF5" },
  { id: "Rejected",    title: "Rejected",    color: "error",   hex: "#EF4444", bg: "#FEF2F2" },
];

function Kanban() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobsLoading, setJobsLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [movingId, setMovingId] = useState(null);
  const { showSuccess, showError } = useToast();

  // Interview dialog state
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewTargetId, setInterviewTargetId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState("");

  // ── Load recruiter's jobs for the selector ─────────────────
  useEffect(() => {
    let active = true;
    const recruiterId = user?._id || user?.id;
    const params = recruiterId ? { recruiterId } : {};

    Promise.all([
      fetchJobs({ ...params, status: "active" }),
      fetchJobs({ ...params, status: "archived" }),
    ])
      .then(([activeData, archivedData]) => {
        if (active) {
          const combined = [
            ...(Array.isArray(activeData?.jobs) ? activeData.jobs : []),
            ...(Array.isArray(archivedData?.jobs) ? archivedData.jobs : []),
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

  // ── Load applications when job is selected ─────────────────
  const loadJobApplications = useCallback(async (jobId) => {
    if (jobId === "all") {
      return;
    }

    setAppsLoading(true);
    setFetchError("");

    try {
      const [data, rankings] = await Promise.all([
        fetchApplicationsByJob(jobId),
        fetchJobRankings(jobId).catch(() => ({ rankings: [] })),
      ]);
      const enriched = enrichApplicationsWithRankings(data, rankings);
      setApplications(enriched);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load candidates.");
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function run() {
      await loadJobApplications(selectedJobId);
    }
    void run();
  }, [selectedJobId, loadJobApplications]);

  // ── Move card to a new status column ──────────────────────
  const handleMoveCard = async (applicationId, newStatus, customDetails = null) => {
    if (newStatus === "Interview" && !customDetails) {
      setInterviewTargetId(applicationId);
      setInterviewDetails("Date: Tomorrow, 2:00 PM IST\nLink: https://meet.google.com/interview\nNotes: Technical discussion with team.");
      setInterviewOpen(true);
      return;
    }

    setMovingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus, customDetails);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      showSuccess(`Moved to "${newStatus}" successfully.`);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setMovingId(null);
    }
  };

  // Filter candidates by live search query
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter((app) => {
      const name = app.applicantId?.name?.toLowerCase() || "";
      const email = app.applicantId?.email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [applications, searchQuery]);

  const candidateName = (app) => app.applicantId?.name || "Unknown Candidate";
  const candidateEmail = (app) => app.applicantId?.email || "—";
  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em" }}>
            Recruitment Kanban
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize and transition candidates across your hiring pipeline stages
            {selectedJob ? ` for ${selectedJob.title}` : ""}.
          </Typography>
        </Box>

        {/* Filter Controls: Job Selector + Search */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <OutlinedInput
            size="small"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={selectedJobId === "all"}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              </InputAdornment>
            }
            sx={{ minWidth: 200, backgroundColor: "#FFF" }}
          />

          <FormControl size="small" sx={{ minWidth: 240 }} disabled={jobsLoading}>
            <Select
              value={selectedJobId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedJobId(val);
                if (val === "all") {
                  setApplications([]);
                }
              }}
              displayEmpty
              sx={{ backgroundColor: "#FFF" }}
            >
              <MenuItem value="all">— Select an Opening to View —</MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.title}
                  {job.status === "archived" && " (Archived)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

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
            No Job Opening Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose a job from the selector above to manage its candidate workflow.
          </Typography>
        </Box>
      )}

      {/* Kanban Board Columns */}
      {selectedJobId !== "all" && (
        <Grid container spacing={2}>
          {COLUMNS.map((column) => {
            const columnCards = filteredApplications.filter((app) => app.status === column.id);

            return (
              <Grid item xs={12} sm={6} md={2.4} key={column.id}>
                <Box
                  sx={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderTop: `4px solid ${column.hex}`,
                    borderRadius: "16px",
                    minHeight: 560,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Column Header */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0F172A" }}>
                      {column.title}
                    </Typography>
                    <Chip
                      label={appsLoading ? "…" : columnCards.length}
                      size="small"
                      sx={{
                        backgroundColor: column.bg,
                        color: column.hex,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: 22,
                      }}
                    />
                  </Box>

                  {/* Cards Container */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                    {appsLoading
                      ? [1, 2].map((n) => (
                          <Card key={n} sx={{ p: 2, borderRadius: "12px" }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="90%" />
                          </Card>
                        ))
                      : columnCards.map((app) => {
                          const name = candidateName(app);
                          const initials = name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase();

                          return (
                            <Card
                              key={app._id}
                              sx={{
                                borderRadius: "14px",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0 2px 8px -1px rgba(15, 23, 42, 0.04)",
                                opacity: movingId === app._id ? 0.5 : 1,
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  borderColor: "#CBD5E1",
                                  boxShadow: "0 6px 16px -2px rgba(15, 23, 42, 0.08)",
                                },
                              }}
                            >
                              <CardContent sx={{ p: "16px !important" }}>
                                {/* Candidate Avatar + Name */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      fontSize: "0.75rem",
                                      fontWeight: 700,
                                      bgcolor: column.bg,
                                      color: column.hex,
                                    }}
                                  >
                                    {initials}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography fontWeight={700} fontSize="0.875rem" noWrap sx={{ color: "#0F172A" }}>
                                      {name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                      {candidateEmail(app)}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* AI Match Score Progress Bar */}
                                <Box sx={{ mt: 1.25, mb: 1.25 }}>
                                  <AIMatchProgressBar
                                    score={app.matchScore}
                                    label="AI Match"
                                    showLabel={true}
                                    showCategory={true}
                                    compact={false}
                                    height={5}
                                  />
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                    Applied: {formatDate(app.createdAt)}
                                  </Typography>
                                </Box>

                                {/* Action Transition Pills */}
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                                  {COLUMNS.filter((c) => c.id !== column.id).map((target) => (
                                    <Button
                                      key={target.id}
                                      size="small"
                                      variant="outlined"
                                      disabled={movingId === app._id}
                                      onClick={() => handleMoveCard(app._id, target.id)}
                                      sx={{
                                        fontSize: "0.68rem",
                                        py: 0.3,
                                        px: 0.8,
                                        borderColor: "#E2E8F0",
                                        color: target.hex,
                                        "&:hover": {
                                          borderColor: target.hex,
                                          backgroundColor: target.bg,
                                        },
                                      }}
                                    >
                                      → {target.title}
                                    </Button>
                                  ))}
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}

                    {/* Empty column placeholder */}
                    {!appsLoading && columnCards.length === 0 && (
                      <Box
                        sx={{
                          border: "1px dashed #CBD5E1",
                          borderRadius: "12px",
                          p: 3,
                          textAlign: "center",
                          my: "auto",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No candidates in {column.title}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Interview Scheduling Dialog */}
      <Dialog
        open={interviewOpen}
        onClose={() => {
          setInterviewOpen(false);
          setInterviewTargetId(null);
          setInterviewDetails("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Schedule Interview Invitation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide interview date, time, meeting link, or instructions. An automated email invitation will be dispatched to the candidate.
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Interview Details & Agenda"
            value={interviewDetails}
            onChange={(e) => setInterviewDetails(e.target.value)}
            placeholder="Date: Tomorrow, 2:00 PM IST&#10;Platform: Google Meet&#10;Link: https://meet.google.com/xyz-abcd-efg"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setInterviewOpen(false);
              setInterviewTargetId(null);
              setInterviewDetails("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              const targetId = interviewTargetId;
              const details = interviewDetails;
              setInterviewOpen(false);
              setInterviewTargetId(null);
              setInterviewDetails("");
              await handleMoveCard(targetId, "Interview", details);
            }}
          >
            Confirm & Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Kanban;