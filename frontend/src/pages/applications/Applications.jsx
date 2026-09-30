import {
  Box,
  Button,
  Card,
  CardContent,
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
  const applications = [
    {
      id: 1,
      candidate: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      job: "Frontend Developer",
      appliedDate: "30 Sep 2026",
      status: "Applied",
    },
    {
      id: 2,
      candidate: "Priya Singh",
      email: "priya.singh@gmail.com",
      job: "Full Stack Developer",
      appliedDate: "29 Sep 2026",
      status: "Shortlisted",
    },
    {
      id: 3,
      candidate: "Amit Kumar",
      email: "amit.kumar@gmail.com",
      job: "Backend Developer",
      appliedDate: "28 Sep 2026",
      status: "Applied",
    },
    {
      id: 4,
      candidate: "Neha Verma",
      email: "neha.verma@gmail.com",
      job: "Frontend Developer",
      appliedDate: "27 Sep 2026",
      status: "Rejected",
    },
    {
      id: 5,
      candidate: "Arjun Patel",
      email: "arjun.patel@gmail.com",
      job: "Full Stack Developer",
      appliedDate: "26 Sep 2026",
      status: "Shortlisted",
    },
    {
      id: 6,
      candidate: "Sneha Gupta",
      email: "sneha.gupta@gmail.com",
      job: "Backend Developer",
      appliedDate: "25 Sep 2026",
      status: "Rejected",
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
                        onClick={() =>
                          console.log(
                            "View application:",
                            application.candidate
                          )
                        }
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
    </Box>
  );
}

export default Applications;