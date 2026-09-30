import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function Applications() {
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

        {/* Job Selector */}
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

      {/* Applications Content Placeholder */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Candidate Applications
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Applications for the selected job will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Applications;