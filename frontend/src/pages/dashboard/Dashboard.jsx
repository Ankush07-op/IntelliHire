import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
  Button,
  Avatar,
  Divider,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PsychologyIcon from "@mui/icons-material/Psychology";

import { useAuth } from "../../context/useAuth";
import { fetchJobs } from "../../services/jobService";
import {
  fetchApplicationsByJob,
  fetchJobRankings,
} from "../../services/applicationService";
import { enrichApplicationsWithRankings } from "../../utils/scoreUtils";
import AIMatchProgressBar from "../../components/ai/AIMatchProgressBar";

// Helper for stage colors
const STAGE_COLORS = {
  Applied: { main: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  Shortlisted: { main: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  Interview: { main: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
  Offered: { main: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  Rejected: { main: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
};

function StatCard({ label, value, subtitle, icon, colorGradient, loading }) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1, letterSpacing: "-0.03em" }}>
              {loading ? <Skeleton width={60} height={40} /> : value ?? "0"}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: colorGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    archivedJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    offered: 0,
    rejected: 0,
    applied: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [topSkills, setTopSkills] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const recruiterId = user?._id || user?.id;
        const params = recruiterId ? { recruiterId } : {};

        // 1. Fetch recruiter jobs (active + archived)
        const [activeData, archivedData] = await Promise.all([
          fetchJobs({ ...params, status: "active", limit: 100 }),
          fetchJobs({ ...params, status: "archived", limit: 100 }),
        ]);

        const activeJobs = Array.isArray(activeData?.jobs) ? activeData.jobs : [];
        const archivedJobs = Array.isArray(archivedData?.jobs) ? archivedData.jobs : [];
        const allJobs = [...activeJobs, ...archivedJobs];

        // 2. Compute Top In-Demand Skills across active jobs
        const skillCounts = {};
        activeJobs.forEach((j) => {
          if (Array.isArray(j.requiredSkills)) {
            j.requiredSkills.forEach((s) => {
              const trimmed = s.trim();
              if (trimmed) {
                skillCounts[trimmed] = (skillCounts[trimmed] || 0) + 1;
              }
            });
          }
        });
        const sortedSkills = Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        // 3. Fetch applications & AI rankings for recruiter's active jobs
        const appResults = await Promise.allSettled(
          activeJobs.map((job) =>
            Promise.all([
              fetchApplicationsByJob(job._id),
              fetchJobRankings(job._id).catch(() => ({ rankings: [] })),
            ]).then(([apps, rankings]) => {
              const enriched = enrichApplicationsWithRankings(apps, rankings);
              return enriched.map((app) => ({ ...app, jobTitle: job.title, jobId: job._id }));
            })
          )
        );

        let totalApps = 0;
        let appliedCount = 0;
        let shortlistedCount = 0;
        let interviewCount = 0;
        let offeredCount = 0;
        let rejectedCount = 0;
        const aggregatedApplications = [];

        appResults.forEach((res) => {
          if (res.status === "fulfilled" && Array.isArray(res.value)) {
            res.value.forEach((app) => {
              totalApps++;
              aggregatedApplications.push(app);
              if (app.status === "Shortlisted") shortlistedCount++;
              else if (app.status === "Interview") interviewCount++;
              else if (app.status === "Offered") offeredCount++;
              else if (app.status === "Rejected") rejectedCount++;
              else appliedCount++;
            });
          }
        });

        // Sort applications by createdAt desc
        aggregatedApplications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (!cancelled) {
          setStats({
            totalJobs: allJobs.length,
            activeJobs: activeJobs.length,
            archivedJobs: archivedJobs.length,
            totalApplications: totalApps,
            applied: appliedCount,
            shortlisted: shortlistedCount,
            interviews: interviewCount,
            offered: offeredCount,
            rejected: rejectedCount,
          });
          setRecentJobs(activeJobs.slice(0, 5));
          setRecentApplications(aggregatedApplications.slice(0, 6));
          setTopSkills(sortedSkills);
        }
      } catch (err) {
        console.error("Dashboard metrics load error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Compute conversion rates
  const shortlistRate = stats.totalApplications > 0
    ? ((stats.shortlisted / stats.totalApplications) * 100).toFixed(1)
    : "0.0";
  const interviewRate = stats.totalApplications > 0
    ? (((stats.interviews + stats.offered) / stats.totalApplications) * 100).toFixed(1)
    : "0.0";

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Welcome Header & Quick Action Bar ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em", color: "#0F172A" }}>
            Talent Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here is your real-time recruitment intelligence.
          </Typography>
        </Box>

        {/* Quick Action Buttons */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/recruiter/jobs")}
            sx={{ fontWeight: 700 }}
          >
            Post Job
          </Button>

          <Button
            variant="outlined"
            startIcon={<ViewKanbanIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/kanban")}
            sx={{ fontWeight: 600 }}
          >
            Pipeline Kanban
          </Button>

          <Button
            variant="outlined"
            startIcon={<EmojiEventsIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/recruiter/ranking")}
            sx={{ fontWeight: 600 }}
          >
            AI Rankings
          </Button>
        </Box>
      </Box>

      {/* ── Stat Cards Grid (4 Top KPIs) ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Openings"
            value={stats.activeJobs}
            subtitle={`${stats.archivedJobs} archived postings`}
            icon={<WorkIcon sx={{ fontSize: 24 }} />}
            colorGradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Candidates"
            value={stats.totalApplications}
            subtitle={`${shortlistRate}% qualification rate`}
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
            colorGradient="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Shortlisted"
            value={stats.shortlisted}
            subtitle="Ready for recruiter interview"
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            colorGradient="linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Interviews"
            value={stats.interviews}
            subtitle={`${interviewRate}% interview conversion`}
            icon={<EventAvailableIcon sx={{ fontSize: 24 }} />}
            colorGradient="linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Middle Section: Pipeline Funnel + Skill Demands ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: Pipeline Funnel Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Application Pipeline Funnel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Candidate stage distribution across all active jobs
                  </Typography>
                </Box>
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                  label={`Shortlist: ${shortlistRate}%`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "#EEF2FF",
                    color: "#4F46E5",
                  }}
                />
              </Box>

              {/* Multi-segment Progress Bar */}
              <Box sx={{ my: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    height: 12,
                    borderRadius: 6,
                    overflow: "hidden",
                    backgroundColor: "#F1F5F9",
                    gap: "2px",
                  }}
                >
                  {stats.totalApplications === 0 ? (
                    <Box sx={{ width: "100%", bgcolor: "#E2E8F0" }} />
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: `${(stats.applied / stats.totalApplications) * 100}%`,
                          bgcolor: STAGE_COLORS.Applied.main,
                          transition: "width 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          width: `${(stats.shortlisted / stats.totalApplications) * 100}%`,
                          bgcolor: STAGE_COLORS.Shortlisted.main,
                          transition: "width 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          width: `${(stats.interviews / stats.totalApplications) * 100}%`,
                          bgcolor: STAGE_COLORS.Interview.main,
                          transition: "width 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          width: `${(stats.offered / stats.totalApplications) * 100}%`,
                          bgcolor: STAGE_COLORS.Offered.main,
                          transition: "width 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          width: `${(stats.rejected / stats.totalApplications) * 100}%`,
                          bgcolor: STAGE_COLORS.Rejected.main,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </>
                  )}
                </Box>
              </Box>

              {/* Stage breakdown detail pills */}
              <Grid container spacing={2}>
                {[
                  { label: "Applied", count: stats.applied, color: STAGE_COLORS.Applied },
                  { label: "Shortlisted", count: stats.shortlisted, color: STAGE_COLORS.Shortlisted },
                  { label: "Interview", count: stats.interviews, color: STAGE_COLORS.Interview },
                  { label: "Offered", count: stats.offered, color: STAGE_COLORS.Offered },
                  { label: "Rejected", count: stats.rejected, color: STAGE_COLORS.Rejected },
                ].map((stage) => {
                  const pct = stats.totalApplications > 0
                    ? ((stage.count / stats.totalApplications) * 100).toFixed(0)
                    : 0;
                  return (
                    <Grid item xs={6} sm={2.4} key={stage.label}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          backgroundColor: stage.color.bg,
                          border: `1px solid ${stage.color.border}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: stage.color.main, fontWeight: 700 }}>
                          {stage.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: "#0F172A", mt: 0.5 }}>
                          {stage.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pct}%
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Recent Active Openings Section */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Active Openings
                </Typography>
                <Button
                  component={Link}
                  to="/recruiter/jobs"
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  View All Jobs
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} variant="rounded" height={60} />
                  ))}
                </Box>
              ) : recentJobs.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No active jobs yet. Click "Post Job" above to create your first opening.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {recentJobs.map((job) => (
                    <Box
                      key={job._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderRadius: "12px",
                        border: "1px solid #F1F5F9",
                        backgroundColor: "#FFFFFF",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "#CBD5E1",
                          backgroundColor: "#F8FAFC",
                        },
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700} sx={{ color: "#0F172A" }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                          <Chip
                            label={job.experienceLevel || "Any Level"}
                            size="small"
                            sx={{ fontSize: "0.7rem", height: 20, bgcolor: "#F1F5F9", fontWeight: 600 }}
                          />
                          {job.requiredSkills?.slice(0, 3).map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 20, bgcolor: "#EEF2FF", color: "#4F46E5", fontWeight: 600 }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate("/recruiter/applications")}
                        sx={{ fontSize: "0.75rem", fontWeight: 600, shrink: 0 }}
                      >
                        Candidates →
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Candidate Activity Stream + Skill Cloud */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            {/* Live Candidate Inflow Stream */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recent Candidates
                  </Typography>
                  <Button
                    component={Link}
                    to="/recruiter/applications"
                    size="small"
                    sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    View All
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} variant="rounded" height={45} />
                    ))}
                  </Box>
                ) : recentApplications.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No candidate submissions yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {recentApplications.map((app) => {
                      const candidateName = app.applicantId?.name || "Candidate";
                      const stageColor = STAGE_COLORS[app.status] || STAGE_COLORS.Applied;
                      return (
                        <Box
                          key={app._id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            borderRadius: "10px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #F1F5F9",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "#EEF2FF",
                                color: "#4F46E5",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                              }}
                            >
                              {candidateName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "#0F172A" }}>
                                {candidateName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                {app.jobTitle}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                            <Box sx={{ minWidth: 140, display: { xs: "none", sm: "block" } }}>
                              <AIMatchProgressBar
                                score={app.matchScore}
                                compact={true}
                                showCategory={true}
                                height={6}
                              />
                            </Box>
                            <Chip
                              label={app.status}
                              size="small"
                              sx={{
                                bgcolor: stageColor.bg,
                                color: stageColor.main,
                                border: `1px solid ${stageColor.border}`,
                                fontWeight: 700,
                                fontSize: "0.68rem",
                                height: 22,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* In-Demand Skills Cloud */}
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <PsychologyIcon sx={{ color: "#4F46E5", fontSize: 22 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Top In-Demand Skills
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Most sought skills across your current active positions:
                </Typography>

                {loading ? (
                  <Skeleton height={60} />
                ) : topSkills.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No required skills defined yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {topSkills.map(([skill, count]) => (
                      <Chip
                        key={skill}
                        label={`${skill} · ${count}`}
                        size="small"
                        sx={{
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          "&:hover": {
                            bgcolor: "#EEF2FF",
                            borderColor: "#C7D2FE",
                            color: "#4F46E5",
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;