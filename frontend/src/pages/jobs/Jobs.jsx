import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";

function Jobs() {
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

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            No jobs have been created yet.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Jobs;