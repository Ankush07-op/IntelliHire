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
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";

import { useState, useEffect, useCallback } from "react";

import {
  fetchJobs,
  createJob,
  updateJob,
  archiveJob,
} from "../../services/jobService";

// Empty form state
const EMPTY_FORM = {
  title: "",
  department: "",
  location: "",
  employmentType: "",
  description: "",
  skills: "",
  experienceLevel: "",
};

function Jobs() {
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Jobs from backend
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Dialog state
  const [editingJobId, setEditingJobId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(EMPTY_FORM);

  // ──────────────────────────────────────────────────────────
  // Fetch all recruiter's jobs (all statuses via query)
  // ──────────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      // Fetch active + archived by not passing a status filter
      const [activeData, archivedData] = await Promise.all([
        fetchJobs({ status: "active" }),
        fetchJobs({ status: "archived" }),
      ]);
      setJobs([...activeData.jobs, ...archivedData.jobs]);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // ──────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Converts comma-separated skill string into a clean string array for the backend
  const parseSkills = (skillString) =>
    skillString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // Converts backend requiredSkills array back into display string for the form
  const skillsToString = (skillsArray) =>
    Array.isArray(skillsArray) ? skillsArray.join(", ") : skillsArray || "";

  // ──────────────────────────────────────────────────────────
  // Dialog handlers
  // ──────────────────────────────────────────────────────────
  const handleOpenDialog = () => {
    setEditingJobId(null);
    setJob(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingJobId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditJob = (jobToEdit) => {
    setJob({
      title: jobToEdit.title,
      department: jobToEdit.department || "",
      location: jobToEdit.location || "",
      employmentType: jobToEdit.employmentType || "",
      description: jobToEdit.description,
      skills: skillsToString(jobToEdit.requiredSkills),
      experienceLevel: jobToEdit.experienceLevel || "",
    });
    setEditingJobId(jobToEdit._id);
    setOpenDialog(true);
  };

  // ──────────────────────────────────────────────────────────
  // Create / Update submit
  // ──────────────────────────────────────────────────────────
  const buildPayload = () => ({
    title: job.title,
    description: job.description,
    requiredSkills: parseSkills(job.skills),
    experienceLevel: job.experienceLevel || undefined,
    // department & location are stored in description context — backend doesn't have these fields
    // but keeping them in form for display; they can be appended to description if needed
  });

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createJob(buildPayload());
      setOpenDialog(false);
      showSnackbar("Job created successfully.");
      loadJobs();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to create job.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateJob = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await updateJob(editingJobId, buildPayload());
      setOpenDialog(false);
      setEditingJobId(null);
      showSnackbar("Job updated successfully.");
      loadJobs();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to update job.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // Archive
  // ──────────────────────────────────────────────────────────
  const handleArchiveJob = async (jobId) => {
    try {
      await archiveJob(jobId);
      showSnackbar("Job archived successfully.");
      loadJobs();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to archive job.", "error");
    }
  };

  // ──────────────────────────────────────────────────────────
  // Derived counts
  // ──────────────────────────────────────────────────────────
  const activeCount = jobs.filter((j) => j.status === "active").length;
  const archivedCount = jobs.filter((j) => j.status === "archived").length;

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Jobs
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your recruitment jobs and openings.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={handleOpenDialog}
        >
          Create Job
        </Button>
      </Box>

      {/* Fetch error banner */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFetchError("")}>
          {fetchError}
        </Alert>
      )}

      {/* Job Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <WorkIcon color="primary" />
                <Box>
                  <Typography color="text.secondary">Total Jobs</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={40} /> : jobs.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography color="text.secondary">Active Jobs</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={40} /> : activeCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ArchiveIcon color="action" />
                <Box>
                  <Typography color="text.secondary">Archived Jobs</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={40} /> : archivedCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Job Listings */}
      <Box>
        {loading ? (
          // Loading skeletons
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((n) => (
              <Grid xs={12} md={6} key={n}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" sx={{ mt: 2 }} />
                    <Skeleton variant="text" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Job Listings
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No jobs have been created yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {jobs.map((item) => (
              <Grid xs={12} md={6} key={item._id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {item.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.experienceLevel || "Any Level"}
                        </Typography>
                      </Box>

                      <Chip
                        label={item.status === "active" ? "Active" : "Archived"}
                        color={item.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Skills chips */}
                    {item.requiredSkills?.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
                        {item.requiredSkills.slice(0, 5).map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {item.requiredSkills.length > 5 && (
                          <Chip
                            label={`+${item.requiredSkills.length - 5} more`}
                            size="small"
                          />
                        )}
                      </Box>
                    )}

                    {/* Job Actions */}
                    <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditJob(item)}
                        disabled={item.status !== "active"}
                      >
                        Edit
                      </Button>

                      {item.status === "active" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleArchiveJob(item._id)}
                        >
                          Archive
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create / Edit Job Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <Box
          component="form"
          onSubmit={editingJobId ? handleUpdateJob : handleCreateJob}
        >
          <DialogTitle>
            {editingJobId ? "Edit Job" : "Create New Job"}
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Job Title"
                  name="title"
                  value={job.title}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    label="Experience Level"
                    name="experienceLevel"
                    value={job.experienceLevel}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <MenuItem value="Entry">Entry</MenuItem>
                    <MenuItem value="Mid">Mid</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={job.department}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    label="Employment Type"
                    name="employmentType"
                    value={job.employmentType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Job Description"
                  name="description"
                  value={job.description}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Required Skills"
                  name="skills"
                  value={job.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MongoDB"
                  helperText="Separate skills with commas — used by AI matching engine"
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AddIcon />
                )
              }
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingJobId
                  ? "Update Job"
                  : "Create Job"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Jobs;