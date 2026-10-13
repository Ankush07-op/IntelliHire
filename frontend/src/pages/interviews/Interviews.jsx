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

    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
      [],
      { hour: "numeric", minute: "2-digit" }
    );
  };

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

  const confirmCancellation = () => {
    if (!selectedInterview) return;

    const success = updateInvitationStatus(
      selectedInterview.id,
      "Cancelled"
    );

    if (success) setSelectedInterview(null);
  };

  const updateInvitationStatus = (id, status) =>
    updateInvitation(id, { status });

  const openReschedule = (interview) => {
    setError("");
    setNewDate(interview.date || "");
    setNewTime(interview.time || "");
    setRescheduleInterview(interview);
  };

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

    const success = updateInvitation(
      rescheduleInterview.id,
      {
        date: newDate,
        time: newTime,
        status: "Scheduled",
        updatedAt: new Date().toISOString(),
      }
    );

    if (success) setRescheduleInterview(null);
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

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography color="text.secondary" variant="body2">
          Total saved invitations
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {interviews.length}
        </Typography>
      </Paper>

      {interviews.length === 0 ? (
        <Alert severity="info">
          No interviews scheduled yet. Open Candidate Ranking and use
          "Invite for Interview" to save an interview invitation.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
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
              {[...interviews].reverse().map((interview) => {
                const cancelled = interview.status === "Cancelled";

                return (
                  <TableRow key={interview.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {interview.candidateName || "Candidate"}
                      </Typography>
                      {interview.candidateEmail && (
                        <Typography variant="body2" color="text.secondary">
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
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          startIcon={<EditCalendarIcon />}
                          disabled={cancelled}
                          onClick={() => openReschedule(interview)}
                        >
                          Reschedule
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelOutlinedIcon />}
                          disabled={cancelled}
                          onClick={() => {
                            setError("");
                            setSelectedInterview(interview);
                          }}
                        >
                          {cancelled ? "Cancelled" : "Cancel"}
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

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Interview changes are saved locally in this browser. They do not send
        emails or notify candidates.
      </Typography>

      <Dialog
        open={Boolean(selectedInterview)}
        onClose={() => setSelectedInterview(null)}
        aria-labelledby="cancel-interview-title"
      >
        <DialogTitle id="cancel-interview-title">
          Cancel interview?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the interview for{" "}
            <strong>
              {selectedInterview?.candidateName || "this candidate"}
            </strong>
            ? The invitation status will be changed to Cancelled.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInterview(null)}>
            Keep Interview
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmCancellation}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

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
            </strong>.
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