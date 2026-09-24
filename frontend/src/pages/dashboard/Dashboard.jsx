import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600}>
        Dashboard
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1, mb: 3 }}
      >
        Welcome to the IntelliHire Recruiter Portal.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Total Jobs
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Applications
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Candidates
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;