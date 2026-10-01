import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Paper,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

function Applications() {
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applications = [
    {
      id: 1,
      candidate: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      job: "Frontend Developer",
      appliedDate: "30 Sep 2026",
      status: "Applied",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      education: "MCA",
      experience: "2 Years",
      skills: ["React.js", "JavaScript", "HTML", "CSS"],
      summary:
        "Frontend developer with experience building responsive web applications using React.js and modern JavaScript.",
    },
    {
      id: 2,
      candidate: "Priya Singh",
      email: "priya.singh@gmail.com",
      job: "Full Stack Developer",
      appliedDate: "29 Sep 2026",
      status: "Shortlisted",
      phone: "+91 98765 12345",
      location: "Bangalore, India",
      education: "M.Tech Computer Science",
      experience: "3 Years",
      skills: ["React.js", "Node.js", "MongoDB", "Express.js"],
      summary:
        "Full stack developer experienced in developing scalable web applications using React, Node.js and MongoDB.",
    },
    {
      id: 3,
      candidate: "Amit Kumar",
      email: "amit.kumar@gmail.com",
      job: "Backend Developer",
      appliedDate: "28 Sep 2026",
      status: "Applied",
      phone: "+91 99887 66554",
      location: "Pune, India",
      education: "B.Tech Computer Science",
      experience: "1 Year",
      skills: ["Node.js", "Express.js", "PostgreSQL", "REST API"],
      summary:
        "Backend developer focused on REST APIs, database development and server-side application logic.",
    },
    {
      id: 4,
      candidate: "Neha Verma",
      email: "neha.verma@gmail.com",
      job: "Frontend Developer",
      appliedDate: "27 Sep 2026",
      status: "Rejected",
      phone: "+91 91234 56789",
      location: "Delhi, India",
      education: "BCA",
      experience: "1 Year",
      skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      summary:
        "Frontend developer with experience creating responsive interfaces and basic web applications.",
    },
    {
      id: 5,
      candidate: "Arjun Patel",
      email: "arjun.patel@gmail.com",
      job: "Full Stack Developer",
      appliedDate: "26 Sep 2026",
      status: "Shortlisted",
      phone: "+91 90000 11223",
      location: "Mumbai, India",
      education: "MCA",
      experience: "4 Years",
      skills: ["React.js", "Node.js", "MongoDB", "AWS"],
      summary:
        "Experienced full stack developer with strong knowledge of frontend, backend and cloud technologies.",
    },
    {
      id: 6,
      candidate: "Sneha Gupta",
      email: "sneha.gupta@gmail.com",
      job: "Backend Developer",
      appliedDate: "25 Sep 2026",
      status: "Rejected",
      phone: "+91 91111 22334",
      location: "Hyderabad, India",
      education: "B.Tech IT",
      experience: "2 Years",
      skills: ["Java", "Spring Boot", "MySQL", "REST API"],
      summary:
        "Backend developer experienced in Java-based application development and database management.",
    },
  ];

  const stats = [
    {
      title: "Total Applications",
      value: 12,
      icon: <PeopleIcon />,
    },
    {
      title: "Pending Review",
      value: 5,
      icon: <PendingActionsIcon />,
    },
    {
      title: "Shortlisted",
      value: 4,
      icon: <CheckCircleIcon />,
    },
    {
      title: "Rejected",
      value: 3,
      icon: <CancelIcon />,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "success";

      case "Rejected":
        return "error";

      case "Applied":
        return "warning";

      default:
        return "default";
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseDetails = () => {
    setSelectedApplication(null);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Applications
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Review and manage candidate applications for your jobs.
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="job-select-label">Select Job</InputLabel>

          <Select
            labelId="job-select-label"
            id="job-select"
            value="all"
            label="Select Job"
          >
            <MenuItem value="all">All Jobs</MenuItem>
            <MenuItem value="frontend">Frontend Developer</MenuItem>
            <MenuItem value="backend">Backend Developer</MenuItem>
            <MenuItem value="fullstack">Full Stack Developer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Application Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid
            key={stat.title}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
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
                      sx={{ mb: 1 }}
                    >
                      {stat.title}
                    </Typography>

                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Applications Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Candidate Applications
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              View candidates who have applied for your jobs.
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table sx={{ minWidth: 850 }}>
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
                {applications.map((application) => (
                  <TableRow
                    key={application.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>
                        {application.candidate}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {application.email}
                      </Typography>
                    </TableCell>

                    <TableCell>{application.job}</TableCell>

                    <TableCell>{application.appliedDate}</TableCell>

                    <TableCell>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewApplication(application)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Candidate Details Dialog */}
      <Dialog
        open={Boolean(selectedApplication)}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight={700}>
                Candidate Details
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Application #{selectedApplication.id}
              </Typography>
            </DialogTitle>

            <DialogContent dividers>
              {/* Candidate Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedApplication.candidate}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {selectedApplication.email}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Basic Information */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Application Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Applied For
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.job}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Applied Date
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.appliedDate}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedApplication.status}
                      color={getStatusColor(selectedApplication.status)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.phone}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.location}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Education
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.education}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Experience
                  </Typography>

                  <Typography fontWeight={600}>
                    {selectedApplication.experience}
                  </Typography>
                </Grid>
              </Grid>

              {/* Skills */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Skills
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 3,
                }}
              >
                {selectedApplication.skills.map((skill) => (
                  <Chip key={skill} label={skill} variant="outlined" />
                ))}
              </Box>

              {/* Summary */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Application Summary
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedApplication.summary}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDetails} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Applications;