import { useState, useEffect, useCallback } from "react";

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
  InputLabel,
  MenuItem,
  Paper,
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
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  updateApplicationStatus,
  fetchResumeDownloadUrl,
  fetchApplicationAnalysis,
  reanalyzeApplication,
} from "../../services/applicationService";

// Backend status enum (must match Application.js model)
const PIPELINE_STATUSES = ["Applied", "Shortlisted", "Interview", "Offered", "Rejected"];

const getStatusColor = (status) => {
  switch (status) {
    case "Shortlisted": return "success";
    case "Interview":   return "info";
    case "Offered":     return "primary";
    case "Rejected":    return "error";
    case "Applied":     return "warning";
    default:            return "default";
  }
};

function Applications() {
  // ── Jobs (for filter dropdown) ──────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [jobsLoading, setJobsLoading] = useState(true);

  // ── Applications ────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // ── Candidate detail dialog ──────────────────────────────────
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // ── Status update ────────────────────────────────────────────
  const [statusUpdating, setStatusUpdating] = useState(false);

  // ── Resume dialog ────────────────────────────────────────────
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [resumeCandidate, setResumeCandidate] = useState(null);

  // ── Snackbar ─────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ── Fetch recruiter's active jobs for the filter ─────────────
  useEffect(() => {
    setJobsLoading(true);
    Promise.all([
      fetchJobs({ status: "active" }),
      fetchJobs({ status: "archived" }),
    ])
      .then(([activeData, archivedData]) => {
        setJobs([...activeData.jobs, ...archivedData.jobs]);
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  // ── Fetch applications when job filter changes ───────────────
  const loadApplications = useCallback(async () => {
    if (selectedJobId === "all") {
      setApplications([]);
      return;
    }
    setAppsLoading(true);
    setFetchError("");
    try {
      const data = await fetchApplicationsByJob(selectedJobId);
      setApplications(data);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // ── Helpers ───────────────────────────────────────────────────
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  // ── Candidate detail dialog ───────────────────────────────────
  const handleViewApplication = async (application) => {
    setSelectedApplication(application);
    setAnalysis(null);
    setAnalysisLoading(true);
    try {
      const data = await fetchApplicationAnalysis(application._id);
      setAnalysis(data);
    } catch {
      // Analysis may still be processing — non-critical
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedApplication(null);
    setAnalysis(null);
  };

  // ── Status update ─────────────────────────────────────────────
  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Update local state without a full refetch
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      if (selectedApplication?._id === applicationId) {
        setSelectedApplication((prev) => ({ ...prev, status: newStatus }));
      }
      showSnackbar(`Status updated to "${newStatus}" successfully.`);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to update status.", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ── Re-analyze ────────────────────────────────────────────────
  const handleReanalyze = async (applicationId) => {
    try {
      await reanalyzeApplication(applicationId);
      showSnackbar("Re-analysis triggered. Results will update shortly.");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to trigger re-analysis.", "error");
    }
  };

  // ── Resume dialog ─────────────────────────────────────────────
  const handleViewResume = async (application) => {
    setResumeCandidate(application);
    setResumeUrl(null);
    setResumeError("");
    setResumeLoading(true);
    setResumeOpen(true);
    try {
      const { downloadUrl } = await fetchResumeDownloadUrl(application._id);
      setResumeUrl(downloadUrl);
    } catch (err) {
      setResumeError(err.response?.data?.message || "Could not load resume.");
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCloseResume = () => {
    setResumeOpen(false);
    setResumeCandidate(null);
    setResumeUrl(null);
    setResumeError("");
  };

  const handleDownloadResume = () => {
    if (!resumeUrl) return;
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  // ── Derived stats ──────────────────────────────────────────────
  const totalApplications = applications.length;
  const pendingCount  = applications.filter((a) => a.status === "Applied").length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  const candidateName = (app) =>
    app.applicantId?.name || "Unknown Candidate";
  const candidateEmail = (app) =>
    app.applicantId?.email || "—";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and review candidate applications
        </Typography>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFetchError("")}>
          {fetchError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Applications", value: totalApplications, icon: <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} /> },
          { label: "Applied / Pending",  value: pendingCount,      icon: <PendingActionsIcon sx={{ fontSize: 40, color: "warning.main" }} /> },
          { label: "Shortlisted",        value: shortlistedCount,  icon: <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} /> },
          { label: "Rejected",           value: rejectedCount,     icon: <CancelIcon sx={{ fontSize: 40, color: "error.main" }} /> },
        ].map(({ label, value, icon }) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                      {appsLoading && selectedJobId !== "all"
                        ? <Skeleton width={40} />
                        : value}
                    </Typography>
                  </Box>
                  {icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Applications Table Card */}
      <Card>
        <CardContent>
          {/* Table Header + Filter */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Candidate Applications
            </Typography>

            <FormControl size="small" sx={{ minWidth: 250 }} disabled={jobsLoading}>
              <InputLabel>Filter by Job</InputLabel>
              <Select
                value={selectedJobId}
                label="Filter by Job"
                onChange={(e) => setSelectedJobId(e.target.value)}
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
          </Box>

          {/* Prompt to select a job */}
          {selectedJobId === "all" && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">
                Select a job above to view its applications.
              </Typography>
            </Box>
          )}

          {/* Applications Table */}
          {selectedJobId !== "all" && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Candidate</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Applied Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Update Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {appsLoading
                    ? [1, 2, 3].map((n) => (
                        <TableRow key={n}>
                          {[1, 2, 3, 4, 5, 6].map((c) => (
                            <TableCell key={c}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : applications.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary" sx={{ py: 4 }}>
                              No applications found for this job.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    : applications.map((app) => (
                        <TableRow key={app._id} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{candidateName(app)}</Typography>
                          </TableCell>

                          <TableCell>{candidateEmail(app)}</TableCell>

                          <TableCell>{formatDate(app.createdAt)}</TableCell>

                          <TableCell>
                            <Chip
                              label={app.status}
                              color={getStatusColor(app.status)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                              <Select
                                value={app.status}
                                onChange={(e) =>
                                  handleStatusChange(app._id, e.target.value)
                                }
                                disabled={statusUpdating}
                              >
                                {PIPELINE_STATUSES.map((s) => (
                                  <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewApplication(app)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Candidate Detail Dialog ───────────────────────────── */}
      <Dialog
        open={Boolean(selectedApplication)}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Candidate Details</DialogTitle>

        <DialogContent dividers>
          {selectedApplication && (
            <>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                  {candidateName(selectedApplication)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidateEmail(selectedApplication)}
                </Typography>
              </Box>

              {/* Application Info */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Application Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Applied Date</Typography>
                  <Typography fontWeight={600}>{formatDate(selectedApplication.createdAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedApplication.status}
                    color={getStatusColor(selectedApplication.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>

              {/* AI Analysis */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                AI Analysis
              </Typography>
              {analysisLoading ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </Box>
              ) : analysis ? (
                <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Match Score
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {analysis.matchScore ?? "—"}%
                  </Typography>
                  {analysis.summary && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {analysis.summary}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 1 }}
                    onClick={() => handleReanalyze(selectedApplication._id)}
                  >
                    Re-analyze
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    AI analysis is still processing or unavailable.
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 1 }}
                    onClick={() => handleReanalyze(selectedApplication._id)}
                  >
                    Trigger Analysis
                  </Button>
                </Box>
              )}

              {/* Update Status */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Update Pipeline Status
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {PIPELINE_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="small"
                    variant={selectedApplication.status === status ? "contained" : "outlined"}
                    color={getStatusColor(status)}
                    disabled={statusUpdating || selectedApplication.status === status}
                    startIcon={statusUpdating && selectedApplication.status !== status
                      ? <CircularProgress size={14} color="inherit" />
                      : null}
                    onClick={() =>
                      handleStatusChange(selectedApplication._id, status)
                    }
                  >
                    {status}
                  </Button>
                ))}
              </Box>

              {/* Resume */}
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>Candidate Resume</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Opens a 15-minute secure link from Cloudinary
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleViewResume(selectedApplication)}
                  >
                    View Resume
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Resume Dialog ──────────────────────────────────────── */}
      <Dialog
        open={resumeOpen}
        onClose={handleCloseResume}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resume Preview</DialogTitle>

        <DialogContent dividers>
          {resumeLoading && (
            <Box
              sx={{
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!resumeLoading && resumeError && (
            <Alert severity="error">{resumeError}</Alert>
          )}

          {!resumeLoading && resumeUrl && (
            <Box>
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {resumeCandidate ? candidateName(resumeCandidate) : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Secure Cloudinary link — expires in 15 minutes
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadResume}
                >
                  Open / Download
                </Button>
              </Box>

              {/* Embed PDF in iframe — works for PDF files */}
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="iframe"
                  src={resumeUrl}
                  title="Resume Preview"
                  sx={{ width: "100%", height: 550, border: 0, display: "block" }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseResume}>Close</Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}

export default Applications;