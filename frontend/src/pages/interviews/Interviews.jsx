import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import SearchIcon from "@mui/icons-material/Search";

const STORAGE_KEY = "interviewInvitations";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
};

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [rescheduleInterview, setRescheduleInterview] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];

      setInterviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setInterviews([]);
      setError("Unable to read saved interview invitations.");
    }
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleDateString();
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":").map(Number);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return time;
    }

    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Update an invitation and persist it in localStorage.
  const updateInvitation = (id, changes) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(current)) {
        throw new Error("Invalid saved interview data.");
      }

      const updated = current.map((interview) =>
        interview.id === id ? { ...interview, ...changes } : interview
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInterviews(updated);
      setError("");

      return true;
    } catch {
      setError("Unable to update the interview. Please try again.");
      return false;
    }
  };

  const updateInvitationStatus = (id, status) =>
    updateInvitation(id, {
      status,
      updatedAt: new Date().toISOString(),
    });

  // Confirm cancellation or completion.
  const confirmInterviewAction = () => {
    if (!selectedInterview) return;

    const status =
      selectedInterview.action === "Complete" ? "Completed" : "Cancelled";

    const success = updateInvitationStatus(selectedInterview.id, status);

    if (success) {
      setSelectedInterview(null);
    }
  };

  // Open reschedule dialog.
  const openReschedule = (interview) => {
    setError("");
    setNewDate(interview.date || "");
    setNewTime(interview.time || "");
    setRescheduleInterview(interview);
  };

  // Validate and save a new interview date and time.
  const confirmReschedule = () => {
    if (!rescheduleInterview || !newDate || !newTime) {
      setError("Please select both a new date and time.");
      return;
    }

    const scheduledDateTime = new Date(`${newDate}T${newTime}`);

    if (Number.isNaN(scheduledDateTime.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    if (scheduledDateTime <= new Date()) {
      setError("The new interview date and time must be in the future.");
      return;
    }

    const success = updateInvitation(rescheduleInterview.id, {
      date: newDate,
      time: newTime,
      status: "Scheduled",
      updatedAt: new Date().toISOString(),
    });

    if (success) {
      setRescheduleInterview(null);
      setNewDate("");
      setNewTime("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Cancelled":
        return "error";
      case "Completed":
        return "success";
      default:
        return "primary";
    }
  };

  // Day 22: Statistics calculated from all saved invitations.
  const totalInterviews = interviews.length;

  const scheduledInterviews = interviews.filter(
    (interview) => !interview.status || interview.status === "Scheduled"
  ).length;

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "Completed"
  ).length;

  const cancelledInterviews = interviews.filter(
    (interview) => interview.status === "Cancelled"
  ).length;

  // Interview types are generated dynamically from saved data.
  const interviewTypes = [
    ...new Set(
      interviews
        .map((interview) => interview.type)
        .filter((type) => typeof type === "string" && type.trim())
    ),
  ].sort((a, b) => a.localeCompare(b));

  // Search and filters do not affect the summary card counts.
  const filteredInterviews = [...interviews]
    .reverse()
    .filter((interview) => {
      const query = searchTerm.trim().toLowerCase();

      const candidateName = String(
        interview.candidateName || ""
      ).toLowerCase();

      const candidateEmail = String(
        interview.candidateEmail || ""
      ).toLowerCase();

      const matchesSearch =
        candidateName.includes(query) || candidateEmail.includes(query);

      const status = interview.status || "Scheduled";

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesType =
        typeFilter === "All" || interview.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    typeFilter !== "All";

  // Reusable statistics card.
  const renderStatCard = (title, count, icon, color) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: "100%",
        borderTop: 3,
        borderTopColor: `${color}.main`,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mt: 1 }}
          >
            {count}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {/* Page heading */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <EventIcon color="primary" sx={{ fontSize: 32 }} />

        <Box>
          <Typography variant="h4" fontWeight={700}>
            Scheduled Interviews
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage interview invitations saved on this device.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Day 22: Interview statistics */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Interview Overview
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {renderStatCard(
          "Total Interviews",
          totalInterviews,
          <EventIcon sx={{ fontSize: 28 }} />,
          "primary"
        )}

        {renderStatCard(
          "Scheduled",
          scheduledInterviews,
          <EditCalendarIcon sx={{ fontSize: 28 }} />,
          "info"
        )}

        {renderStatCard(
          "Completed",
          completedInterviews,
          <Box component="span" sx={{ fontSize: 28, fontWeight: 700 }}>
            ✓
          </Box>,
          "success"
        )}

        {renderStatCard(
          "Cancelled",
          cancelledInterviews,
          <CancelOutlinedIcon sx={{ fontSize: 28 }} />,
          "error"
        )}
      </Box>

      {/* Search and filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Search and Filter Interviews
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "2fr 1fr 1fr auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search candidate"
            placeholder="Name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value="All">All statuses</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Interview type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <MenuItem value="All">All types</MenuItem>

            {interviewTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!filtersActive}
            sx={{ whiteSpace: "nowrap" }}
          >
            Clear Filters
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredInterviews.length} of {interviews.length} interviews
        </Typography>
      </Paper>

      {/* Interview table */}
      {interviews.length === 0 ? (
        <Alert severity="info">
          No interviews scheduled yet. Open Candidate Ranking and use
          "Invite for Interview" to save an interview invitation.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, overflowX: "auto" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Interview Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredInterviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No interviews match your search or filters.
                    </Typography>

                    <Button onClick={clearFilters} sx={{ mt: 1 }}>
                      Clear Filters
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {filteredInterviews.map((interview) => {
                const cancelled = interview.status === "Cancelled";
                const completed = interview.status === "Completed";
                const locked = cancelled || completed;

                return (
                  <TableRow key={interview.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {interview.candidateName || "Candidate"}
                      </Typography>

                      {interview.candidateEmail && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {interview.candidateEmail}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{formatDate(interview.date)}</TableCell>
                    <TableCell>{formatTime(interview.time)}</TableCell>
                    <TableCell>{interview.type || "—"}</TableCell>

                    <TableCell>
                      <Chip
                        label={interview.status || "Scheduled"}
                        color={getStatusColor(interview.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          minWidth: 150,
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<EditCalendarIcon />}
                          disabled={locked}
                          onClick={() => openReschedule(interview)}
                        >
                          Reschedule
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelOutlinedIcon />}
                          disabled={locked}
                          onClick={() => {
                            setError("");
                            setSelectedInterview({
                              ...interview,
                              action: "Cancel",
                            });
                          }}
                        >
                          {cancelled ? "Cancelled" : "Cancel"}
                        </Button>

                        <Button
                          size="small"
                          color="success"
                          disabled={locked}
                          onClick={() => {
                            setError("");
                            setSelectedInterview({
                              ...interview,
                              action: "Complete",
                            });
                          }}
                        >
                          {completed ? "✓ Completed" : "✓ Mark Completed"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        Interview changes are saved locally in this browser. They do not send
        emails or notify candidates.
      </Typography>

      {/* Cancellation and completion confirmation */}
      <Dialog
        open={Boolean(selectedInterview)}
        onClose={() => setSelectedInterview(null)}
        aria-labelledby="interview-action-title"
      >
        <DialogTitle id="interview-action-title">
          {selectedInterview?.action === "Complete"
            ? "Mark interview as completed?"
            : "Cancel interview?"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {selectedInterview?.action === "Complete"
              ? "mark the interview as completed for"
              : "cancel the interview for"}{" "}
            <strong>
              {selectedInterview?.candidateName || "this candidate"}
            </strong>
            ?{" "}
            {selectedInterview?.action === "Complete"
              ? "The status will be changed to Completed."
              : "The status will be changed to Cancelled."}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedInterview(null)}>
            Go Back
          </Button>

          <Button
            color={
              selectedInterview?.action === "Complete" ? "success" : "error"
            }
            variant="contained"
            onClick={confirmInterviewAction}
          >
            {selectedInterview?.action === "Complete"
              ? "Confirm Completion"
              : "Confirm Cancellation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog
        open={Boolean(rescheduleInterview)}
        onClose={() => setRescheduleInterview(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="reschedule-interview-title"
      >
        <DialogTitle id="reschedule-interview-title">
          Reschedule Interview
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            Choose a new date and time for{" "}
            <strong>
              {rescheduleInterview?.candidateName || "this candidate"}
            </strong>
            .
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            required
            type="date"
            label="New Interview Date"
            value={newDate}
            onChange={(event) => {
              setNewDate(event.target.value);
              setError("");
            }}
            margin="normal"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: getToday() },
            }}
          />

          <TextField
            fullWidth
            required
            type="time"
            label="New Interview Time"
            value={newTime}
            onChange={(event) => {
              setNewTime(event.target.value);
              setError("");
            }}
            margin="normal"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                min: newDate === getToday() ? getCurrentTime() : undefined,
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRescheduleInterview(null)}>
            Keep Current Schedule
          </Button>

          <Button variant="contained" onClick={confirmReschedule}>
            Save New Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Interviews;