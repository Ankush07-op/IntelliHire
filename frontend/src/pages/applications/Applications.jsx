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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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
  fetchJobRankings,
  updateApplicationStatus,
  fetchResumeDownloadUrl,
  fetchApplicationAnalysis,
  reanalyzeApplication,
} from "../../services/applicationService";
import { useToast } from "../../context/ToastContext";
import { enrichApplicationsWithRankings } from "../../utils/scoreUtils";
import AIMatchProgressBar from "../../components/ai/AIMatchProgressBar";

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

  // ── Status update & interview scheduling ────────────────────
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewTargetId, setInterviewTargetId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState("");

  // ── Resume dialog ────────────────────────────────────────────
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [resumeCandidate, setResumeCandidate] = useState(null);

  // ── Toast & Helpers ──────────────────────────────────────────
  const { showToast } = useToast();

  const showSnackbar = useCallback((message, severity = "success") => {
    showToast(message, severity);
  }, [showToast]);

  const handleJobChange = (e) => {
    const newId = e.target.value;
    setSelectedJobId(newId);
    if (newId === "all") {
      setApplications([]);
      setFetchError("");
      setAppsLoading(false);
    } else {
      setAppsLoading(true);
      setFetchError("");
    }
  };

  // ── Fetch recruiter's active jobs for the filter ─────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const recruiterId = user?._id || user?.id;
    const params = recruiterId ? { recruiterId } : {};

    Promise.all([
      fetchJobs({ ...params, status: "active" }),
      fetchJobs({ ...params, status: "archived" }),
    ])
      .then(([activeData, archivedData]) => {
        const combined = [
          ...(Array.isArray(activeData?.jobs) ? activeData.jobs : []),
          ...(Array.isArray(archivedData?.jobs) ? archivedData.jobs : []),
        ];
        setJobs(combined);
      })
      .catch((err) => {
        showSnackbar(err.response?.data?.message || "Failed to load jobs.", "error");
      })
      .finally(() => setJobsLoading(false));
  }, [showSnackbar]);

  // ── Fetch applications when job filter changes ───────────────
  useEffect(() => {
    if (selectedJobId === "all") {
      return;
    }

    let isCurrent = true;

    Promise.all([
      fetchApplicationsByJob(selectedJobId),
      fetchJobRankings(selectedJobId).catch(() => ({ rankings: [] })),
    ])
      .then(([apps, rankings]) => {
        if (isCurrent) {
          const enriched = enrichApplicationsWithRankings(apps, rankings);
          setApplications(enriched);
          setAppsLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setFetchError(err.response?.data?.message || "Failed to load applications.");
          setAppsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedJobId]);

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
  const handleStatusChange = async (applicationId, newStatus, customDetails = null) => {
    // If moving to Interview and no details have been collected yet, prompt the recruiter
    if (newStatus === "Interview" && !customDetails) {
      setInterviewTargetId(applicationId);
      setInterviewDetails("Date: Tomorrow, 2:00 PM IST\nLink: https://meet.google.com/interview\nNotes: Technical discussion with team.");
      setInterviewOpen(true);
      return;
    }

    setStatusUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus, customDetails);
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
    setDownloadLink(null);
    setResumeError("");
    setResumeLoading(true);
    setResumeOpen(true);
    try {
      const data = await fetchResumeDownloadUrl(application._id);
      setResumeUrl(data.viewUrl || data.downloadUrl);
      setDownloadLink(data.downloadUrl);
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
    setDownloadLink(null);
    setResumeError("");
  };

  const handleDownloadResume = () => {
    const target = downloadLink || resumeUrl;
    if (!target) return;
    const link = document.createElement("a");
    link.href = target;
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
                onChange={handleJobChange}
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
                    <TableCell sx={{ minWidth: 170 }}><strong>AI Match Score</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Update Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {appsLoading
                    ? [1, 2, 3].map((n) => (
                        <TableRow key={n}>
                          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                            <TableCell key={c}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : applications.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
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

                          <TableCell sx={{ minWidth: 170 }}>
                            <AIMatchProgressBar
                              score={app.matchScore}
                              compact={true}
                              showCategory={true}
                              height={6}
                            />
                          </TableCell>

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

              {/* AI Evaluation */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                AI Evaluation
              </Typography>
              {analysisLoading ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={8} sx={{ my: 1, borderRadius: 1 }} />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ) : analysis ? (
                <Box sx={{ mb: 3, p: 2.5, bgcolor: "action.hover", borderRadius: 2 }}>
                  {/* Standardized Full-Width AI Match Score Progress Bar */}
                  <AIMatchProgressBar
                    score={analysis.score ?? analysis.matchScore}
                    label="AI Match Score"
                    showLabel={true}
                    showCategory={true}
                    height={8}
                    sx={{ mb: 2 }}
                  />

                  {analysis.experienceYears !== undefined && analysis.experienceYears !== null && (
                    <Box sx={{ mb: 1.5 }}>
                      <Chip
                        size="small"
                        label={`${analysis.experienceYears} yrs relevant experience`}
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}

                  {analysis.summary && (
                    <Typography variant="body2" sx={{ mt: 1, color: "text.primary", lineHeight: 1.6 }}>
                      {analysis.summary}
                    </Typography>
                  )}

                  {/* Matched Skills */}
                  {Array.isArray(analysis.matchedSkills) && analysis.matchedSkills.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="success.main" display="block" sx={{ mb: 0.5 }}>
                        MATCHED SKILLS
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {analysis.matchedSkills.map((s) => (
                          <Chip key={s} label={s} size="small" color="success" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Missing Skills */}
                  {Array.isArray(analysis.missingSkills) && analysis.missingSkills.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" fontWeight={600} color="warning.main" display="block" sx={{ mb: 0.5 }}>
                        MISSING SKILLS
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {analysis.missingSkills.map((s) => (
                          <Chip key={s} label={s} size="small" color="warning" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 2 }}
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
        <DialogActions>
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
            color="info"
            disabled={statusUpdating}
            onClick={async () => {
              const targetId = interviewTargetId;
              const details = interviewDetails;
              setInterviewOpen(false);
              setInterviewTargetId(null);
              setInterviewDetails("");
              await handleStatusChange(targetId, "Interview", details);
            }}
          >
            {statusUpdating ? "Sending..." : "Confirm & Send Invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Applications;