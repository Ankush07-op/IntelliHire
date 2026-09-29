import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useState } from "react";

function Jobs() {
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [job, setJob] = useState({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    description: "",
    skills: "",
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setJob((previousJob) => ({
      ...previousJob,
      [name]: value,
    }));
  };

  const handleCreateJob = (event) => {
    event.preventDefault();

    setOpenDialog(false);
    setSnackbarOpen(true);

    setJob({
      title: "",
      department: "",
      location: "",
      employmentType: "",
      description: "",
      skills: "",
    });
  };

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

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
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

      {/* Job Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <WorkIcon color="primary" />

                <Box>
                  <Typography color="text.secondary">
                    Total Jobs
                  </Typography>

                  <Typography variant="h4" fontWeight={600}>
                    0
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
                  <Typography color="text.secondary">
                    Active Jobs
                  </Typography>

                  <Typography variant="h4" fontWeight={600}>
                    0
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
                  <Typography color="text.secondary">
                    Archived Jobs
                  </Typography>

                  <Typography variant="h4" fontWeight={600}>
                    0
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs List */}
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

      {/* Create Job Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <Box component="form" onSubmit={handleCreateJob}>
          <DialogTitle>Create New Job</DialogTitle>

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
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Department"
                  name="department"
                  value={job.department}
                  onChange={handleChange}
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Location"
                  name="location"
                  value={job.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore / Remote"
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Employment Type</InputLabel>

                  <Select
                    label="Employment Type"
                    name="employmentType"
                    value={job.employmentType}
                    onChange={handleChange}
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
                  helperText="Separate skills with commas"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create Job
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbarOpen(false)}
        >
          Job created successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Jobs;