import { useState, useEffect } from "react";

import {
  Alert,
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
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  updateApplicationStatus,
} from "../../services/applicationService";

// Pipeline columns — must match backend enum exactly
const COLUMNS = [
  { id: "Applied",     title: "Applied",     color: "warning" },
  { id: "Shortlisted", title: "Shortlisted", color: "success" },
  { id: "Interview",   title: "Interview",   color: "info"    },
  { id: "Offered",     title: "Offered",     color: "primary" },
  { id: "Rejected",    title: "Rejected",    color: "error"   },
];


function Kanban() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobsLoading, setJobsLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [movingId, setMovingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Interview dialog state
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewTargetId, setInterviewTargetId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState("");

  // ── Load recruiter's jobs for the selector ─────────────────
  useEffect(() => {
    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        const [active, archived] = await Promise.all([
          fetchJobs({ status: "active" }),
          fetchJobs({ status: "archived" }),
        ]);
        setJobs([...active.jobs, ...archived.jobs]);
      } catch {
        // ignore
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, []);

  // ── Load applications when job is selected ─────────────────
  useEffect(() => {
    if (selectedJobId === "all") {
      return;
    }
    let cancelled = false;
    const loadApplications = async () => {
      setApplications([]);
      setAppsLoading(true);
      setFetchError("");
      try {
        const data = await fetchApplicationsByJob(selectedJobId);
        if (!cancelled) setApplications(data);
      } catch (err) {
        if (!cancelled)
          setFetchError(err.response?.data?.message || "Failed to load applications.");
      } finally {
        if (!cancelled) setAppsLoading(false);
      }
    };
    loadApplications();
    return () => { cancelled = true; };
  }, [selectedJobId]);

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
      setSnackbarMessage(`Moved to "${newStatus}" successfully.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message || "Failed to update status.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setMovingId(null);
    }
  };

  const getColumnCount = (status) =>
    applications.filter((a) => a.status === status).length;

  const candidateName  = (app) => app.applicantId?.name  || "Unknown";
  const candidateEmail = (app) => app.applicantId?.email || "—";

  return (
    <Box>
      {/* Page Header */}
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
            Recruitment Kanban
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track candidates through the recruitment pipeline
          </Typography>
        </Box>

        {/* Job Selector */}
        <FormControl size="small" sx={{ minWidth: 260 }} disabled={jobsLoading}>
          <Select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">— Select a Job to View —</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job._id} value={job._id}>
                {job.title}
                {job.status === "archived" && " (Archived)"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFetchError("")}>
          {fetchError}
        </Alert>
      )}

      {/* Prompt when no job selected */}
      {selectedJobId === "all" && !jobsLoading && (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <Typography color="text.secondary">
            Select a job above to view its candidates on the Kanban board.
          </Typography>
        </Box>
      )}

      {/* Kanban Board */}
      {selectedJobId !== "all" && (
        <Grid container spacing={2}>
          {COLUMNS.map((column) => {
            const columnCards = applications.filter(
              (app) => app.status === column.id
            );

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={column.id}>
                <Box
                  sx={{
                    backgroundColor: "action.hover",
                    borderRadius: 2,
                    minHeight: 480,
                    p: 2,
                  }}
                >
                  {/* Column Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {column.title}
                    </Typography>
                    <Chip
                      label={
                        appsLoading ? "…" : getColumnCount(column.id)
                      }
                      size="small"
                      color={column.color}
                    />
                  </Box>

                  {/* Cards */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {appsLoading
                      ? [1, 2].map((n) => (
                          <Card key={n} elevation={1}>
                            <CardContent>
                              <Skeleton variant="text" width="70%" />
                              <Skeleton variant="text" width="90%" />
                            </CardContent>
                          </Card>
                        ))
                      : columnCards.map((app) => (
                          <Card
                            key={app._id}
                            elevation={1}
                            sx={{
                              borderRadius: 2,
                              opacity: movingId === app._id ? 0.5 : 1,
                              transition: "opacity 0.2s",
                              "&:hover": { boxShadow: 4 },
                            }}
                          >
                            <CardContent>
                              {/* Name */}
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <PersonIcon fontSize="small" color="action" />
                                <Typography fontWeight={600}>
                                  {candidateName(app)}
                                </Typography>
                              </Box>

                              {/* Email */}
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ wordBreak: "break-word" }}
                                >
                                  {candidateEmail(app)}
                                </Typography>
                              </Box>

                              {/* Job label */}
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <WorkIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {jobs.find((j) => j._id === selectedJobId)?.title || ""}
                                </Typography>
                              </Box>

                              {/* Move buttons */}
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {COLUMNS.filter((c) => c.id !== column.id).map((target) => (
                                  <Button
                                    key={target.id}
                                    size="small"
                                    variant="outlined"
                                    color={target.color}
                                    disabled={movingId === app._id}
                                    startIcon={
                                      movingId === app._id
                                        ? <CircularProgress size={12} color="inherit" />
                                        : null
                                    }
                                    onClick={() =>
                                      handleMoveCard(app._id, target.id)
                                    }
                                    sx={{ fontSize: "0.7rem", px: 1, py: 0.4 }}
                                  >
                                    → {target.title}
                                  </Button>
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        ))}

                    {/* Empty column placeholder */}
                    {!appsLoading && columnCards.length === 0 && (
                      <Box
                        sx={{
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                          p: 3,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No candidates
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
        onClose={() => setInterviewOpen(false)}
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
        <DialogActions>
          <Button onClick={() => setInterviewOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="info"
            onClick={async () => {
              const targetId = interviewTargetId;
              const details = interviewDetails;
              setInterviewOpen(false);
              await handleMoveCard(targetId, "Interview", details);
            }}
          >
            Confirm & Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default Kanban;