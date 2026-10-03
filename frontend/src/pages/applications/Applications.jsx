import { useEffect, useState } from "react";

import {
  Alert,
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

import { getApplications } from "../../services/applicationStore";

function Applications() {
  const [selectedJob, setSelectedJob] = useState("all");

  const [applications, setApplications] = useState(
    getApplications()
  );

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeState, setResumeState] = useState("available");
  const [resumeCandidate, setResumeCandidate] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /*
   * Listen for application changes made from Kanban.
   *
   * Kanban updates the shared application store and
   * dispatches the "applicationsUpdated" event.
   */
  useEffect(() => {
    const handleApplicationsUpdated = (event) => {
      setApplications(event.detail);
    };

    window.addEventListener(
      "applicationsUpdated",
      handleApplicationsUpdated
    );

    return () => {
      window.removeEventListener(
        "applicationsUpdated",
        handleApplicationsUpdated
      );
    };
  }, []);

  /*
   * Keep the page synchronized when the browser tab
   * becomes active again.
   */
  useEffect(() => {
    const handleFocus = () => {
      setApplications(getApplications());
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const shortlistedApplications = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "success";

      case "Interview":
        return "info";

      case "Rejected":
        return "error";

      case "Pending":
        return "warning";

      default:
        return "default";
    }
  };

  const filteredApplications =
    selectedJob === "all"
      ? applications
      : applications.filter(
          (application) =>
            application.job.toLowerCase() ===
            selectedJob.toLowerCase()
        );

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseDetails = () => {
    setSelectedApplication(null);
  };

  /*
   * Open resume preview.
   */
  const handleViewResume = (application) => {
    setResumeCandidate(application);
    setResumeOpen(true);
    setResumeLoading(true);
    setResumeState("available");

    setTimeout(() => {
      setResumeLoading(false);
      setResumeState(
        application.resumeState || "available"
      );
    }, 700);
  };

  const handleCloseResume = () => {
    setResumeOpen(false);
    setResumeCandidate(null);
    setResumeLoading(false);
    setResumeState("available");
  };

  /*
   * Generates a temporary HTML resume for demo purposes.
   */
  const getResumeHtml = (application) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${application.candidate} Resume</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #222;
              line-height: 1.6;
              max-width: 850px;
              margin: auto;
            }

            h1 {
              margin-bottom: 5px;
              font-size: 30px;
            }

            .contact {
              color: #666;
              margin-bottom: 25px;
            }

            h2 {
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-top: 25px;
            }

            .skills {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }

            .skill {
              background: #f0f2f5;
              padding: 5px 10px;
              border-radius: 15px;
            }
          </style>
        </head>

        <body>
          <h1>${application.candidate}</h1>

          <div class="contact">
            ${application.email}
            |
            ${application.phone || "Not provided"}
            |
            ${application.location || "Not provided"}
          </div>

          <h2>Professional Summary</h2>

          <p>
            ${application.summary || "Not provided"}
          </p>

          <h2>Education</h2>

          <p>
            ${application.education || "Not provided"}
          </p>

          <h2>Experience</h2>

          <p>
            ${application.experience || "Not provided"}
          </p>

          <h2>Skills</h2>

          <div class="skills">
            ${(application.skills || [])
              .map(
                (skill) =>
                  `<span class="skill">${skill}</span>`
              )
              .join("")}
          </div>
        </body>
      </html>
    `;
  };

  /*
   * Download temporary demo resume.
   */
  const handleDownloadResume = () => {
    if (
      !resumeCandidate ||
      resumeState !== "available"
    ) {
      return;
    }

    const resumeHtml = getResumeHtml(resumeCandidate);

    const blob = new Blob([resumeHtml], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${resumeCandidate.candidate.replace(
      /\s+/g,
      "_"
    )}_Resume.html`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setSnackbarMessage(
      "Resume downloaded successfully"
    );

    setSnackbarOpen(true);
  };

  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Applications
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Manage and review candidate applications
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        {/* Total Applications */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Applications
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {totalApplications}
                  </Typography>
                </Box>

                <PeopleIcon
                  sx={{
                    fontSize: 40,
                    color: "primary.main",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pending
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {pendingApplications}
                  </Typography>
                </Box>

                <PendingActionsIcon
                  sx={{
                    fontSize: 40,
                    color: "warning.main",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shortlisted */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
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
                    sx={{ mt: 1 }}
                  >
                    {shortlistedApplications}
                  </Typography>
                </Box>

                <CheckCircleIcon
                  sx={{
                    fontSize: 40,
                    color: "success.main",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rejected */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Rejected
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {rejectedApplications}
                  </Typography>
                </Box>

                <CancelIcon
                  sx={{
                    fontSize: 40,
                    color: "error.main",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <Card>
        <CardContent>
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
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Candidate Applications
            </Typography>

            <FormControl
              size="small"
              sx={{ minWidth: 220 }}
            >
              <InputLabel>
                Filter by Job
              </InputLabel>

              <Select
                value={selectedJob}
                label="Filter by Job"
                onChange={(event) =>
                  setSelectedJob(event.target.value)
                }
              >
                <MenuItem value="all">
                  All Jobs
                </MenuItem>

                <MenuItem value="frontend developer">
                  Frontend Developer
                </MenuItem>

                <MenuItem value="backend developer">
                  Backend Developer
                </MenuItem>

                <MenuItem value="full stack developer">
                  Full Stack Developer
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Candidate</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Job</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Applied Date</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredApplications.map(
                  (application) => (
                    <TableRow
                      key={application.id}
                      hover
                    >
                      <TableCell>
                        <Typography fontWeight={600}>
                          {application.candidate}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {application.email}
                      </TableCell>

                      <TableCell>
                        {application.job}
                      </TableCell>

                      <TableCell>
                        {application.appliedDate}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={application.status}
                          color={getStatusColor(
                            application.status
                          )}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <VisibilityIcon />
                          }
                          onClick={() =>
                            handleViewApplication(
                              application
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}

                {filteredApplications.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      <Typography
                        color="text.secondary"
                        sx={{ py: 4 }}
                      >
                        No applications found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Candidate Details Dialog */}
      <Dialog
        open={Boolean(selectedApplication)}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Candidate Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedApplication && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  {selectedApplication.candidate}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {selectedApplication.email}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Application Information
              </Typography>

              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Applied For
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.job}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Applied Date
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.appliedDate}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Status
                  </Typography>

                  <Chip
                    label={selectedApplication.status}
                    color={getStatusColor(
                      selectedApplication.status
                    )}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.phone}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Location
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.location}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Education
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.education}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Experience
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.experience}
                  </Typography>
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Skills
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 3,
                }}
              >
                {selectedApplication.skills?.map(
                  (skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      variant="outlined"
                    />
                  )
                )}
              </Box>

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Application Summary
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                {selectedApplication.summary}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
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
                    <Typography fontWeight={600}>
                      Candidate Resume
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Preview or download the
                      candidate resume
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={
                      <DescriptionIcon />
                    }
                    onClick={() =>
                      handleViewResume(
                        selectedApplication
                      )
                    }
                  >
                    View Resume
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Preview Dialog */}
      <Dialog
        open={resumeOpen}
        onClose={handleCloseResume}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Resume Preview
        </DialogTitle>

        <DialogContent dividers>
          {resumeLoading && (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography>
                Loading resume...
              </Typography>
            </Box>
          )}

          {!resumeLoading &&
            resumeState === "available" &&
            resumeCandidate && (
              <Box>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f5f7fa",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {resumeCandidate.candidate}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Demo resume preview
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadResume}
                  >
                    Download Resume
                  </Button>
                </Box>

                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    component="iframe"
                    srcDoc={getResumeHtml(
                      resumeCandidate
                    )}
                    title="Resume Preview"
                    sx={{
                      width: "100%",
                      height: 550,
                      border: 0,
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}

          {!resumeLoading &&
            resumeState === "unsupported" && (
              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: 60,
                    color: "warning.main",
                    mb: 2,
                  }}
                />

                <Typography variant="h6">
                  Unsupported Resume Format
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  This resume format cannot be
                  previewed.
                </Typography>
              </Box>
            )}

          {!resumeLoading &&
            resumeState === "error" && (
              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  color="error"
                >
                  Unable to Load Resume
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Something went wrong while
                  loading the resume. Please
                  try again later.
                </Typography>
              </Box>
            )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseResume}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbarOpen(false)
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() =>
            setSnackbarOpen(false)
          }
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Applications;