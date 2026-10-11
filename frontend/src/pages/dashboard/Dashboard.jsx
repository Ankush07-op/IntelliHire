import { useState, useEffect } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useAuth } from "../../context/useAuth";
import { fetchJobs } from "../../services/jobService";
import { fetchApplicationsByJob } from "../../services/applicationService";

function StatCard({ label, value, icon, color = "primary.main", loading }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {loading ? <Skeleton width={60} /> : value ?? "—"}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalJobs: null,
    activeJobs: null,
    totalApplications: null,
    shortlisted: null,
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      try {
        // Fetch active + archived jobs in parallel
        const [activeData, archivedData] = await Promise.all([
          fetchJobs({ status: "active", limit: 100 }),
          fetchJobs({ status: "archived", limit: 100 }),
        ]);

        const allJobs = [...activeData.jobs, ...archivedData.jobs];
        const activeJobs = activeData.jobs;

        // Fetch applications for each active job (in parallel), ignore failures
        const appResults = await Promise.allSettled(
          activeJobs.map((job) => fetchApplicationsByJob(job._id))
        );

        let totalApplications = 0;
        let shortlisted = 0;

        appResults.forEach((result) => {
          if (result.status === "fulfilled") {
            totalApplications += result.value.length;
            shortlisted += result.value.filter(
              (app) => app.status === "Shortlisted"
            ).length;
          }
        });

        if (!cancelled) {
          setStats({
            totalJobs: allJobs.length,
            activeJobs: activeJobs.length,
            totalApplications,
            shortlisted,
          });
          setRecentJobs(allJobs.slice(0, 5));
        }
      } catch {
        // Non-critical — leave stats as null (shown as —)
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();
    return () => { cancelled = true; };
  }, []);



  return (
    <Box>
      {/* Welcome */}
      <Typography variant="h4" fontWeight={600}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Welcome back{user?.name ? `, ${user.name}` : ""}! Here's your recruitment overview.
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            label="Total Jobs"
            value={stats.totalJobs}
            icon={<WorkIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
            loading={loading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            label="Active Jobs"
            value={stats.activeJobs}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="success.main"
            loading={loading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            label="Total Applications"
            value={stats.totalApplications}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info.main"
            loading={loading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            label="Shortlisted"
            value={stats.shortlisted}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Recent Jobs */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Recent Job Postings
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : recentJobs.length === 0 ? (
            <Typography color="text.secondary">
              No jobs created yet. Head to the Jobs page to post your first role.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentJobs.map((job) => (
                <Box
                  key={job._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.experienceLevel || "Any level"}
                      {job.requiredSkills?.length > 0 &&
                        ` · ${job.requiredSkills.slice(0, 3).join(", ")}`}
                    </Typography>
                  </Box>
                  <Chip
                    label={job.status === "active" ? "Active" : "Archived"}
                    color={job.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;