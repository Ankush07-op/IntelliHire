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
  Typography,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const STORAGE_KEY = "interviewInvitations";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
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

  const confirmCancellation = () => {
    if (!selectedInterview) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(current)) {
        throw new Error("Invalid saved interview data.");
      }

      const updated = current.map((interview) =>
        interview.id === selectedInterview.id
          ? { ...interview, status: "Cancelled" }
          : interview
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInterviews(updated);
      setSelectedInterview(null);
      setError("");
    } catch {
      setError("Unable to cancel this interview. Please try again.");
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
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        disabled={cancelled}
                        onClick={() => setSelectedInterview(interview)}
                      >
                        {cancelled ? "Cancelled" : "Cancel"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Invitations are stored locally in this browser. Cancellation does not
        send an email or notify the candidate.
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
    </Box>
  );
}

export default Interviews;