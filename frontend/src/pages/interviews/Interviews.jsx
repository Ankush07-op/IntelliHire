import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
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

const STORAGE_KEY = "interviewInvitations";

function Interviews() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];

      setInterviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setInterviews([]);
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
            View interview invitations saved on this device.
          </Typography>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 3, borderRadius: 2 }}
      >
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
              </TableRow>
            </TableHead>

            <TableBody>
              {[...interviews]
                .reverse()
                .map((interview) => (
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

                    <TableCell>
                      {formatDate(interview.date)}
                    </TableCell>

                    <TableCell>
                      {formatTime(interview.time)}
                    </TableCell>

                    <TableCell>
                      {interview.type || "—"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={interview.status || "Scheduled"}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        These invitations are stored locally in this browser. They
        are not automatically emailed or synchronized with other
        devices.
      </Typography>
    </Box>
  );
}

export default Interviews;