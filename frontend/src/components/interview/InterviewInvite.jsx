import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";

const STORAGE_KEY = "interviewInvitations";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSavedInvitations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const initialForm = {
  date: "",
  time: "",
  type: "Online",
  message:
    "Please join the interview 5 minutes before the scheduled time.",
};

const InterviewInvite = ({ candidate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...initialForm });
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const candidateName = candidate?.candidate || "Candidate";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleOpen = () => {
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.time) {
      setError("Please select an interview date and time.");
      return;
    }

    const interviewDateTime = new Date(
      `${formData.date}T${formData.time}`
    );

    if (Number.isNaN(interviewDateTime.getTime())) {
      setError("Please enter a valid interview date and time.");
      return;
    }

    if (interviewDateTime <= new Date()) {
      setError("Please choose a future interview date and time.");
      return;
    }

    const invitation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      candidateName,
      candidateEmail: candidate?.email || "",
      date: formData.date,
      time: formData.time,
      type: formData.type,
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
      status: "Scheduled",
    };

    try {
      const invitations = getSavedInvitations();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...invitations, invitation])
      );
    } catch {
      setError(
        "Unable to save the invitation on this device. Please check available storage."
      );
      return;
    }

    setOpen(false);
    setFormData({ ...initialForm });
    setNotification(
      "Interview invitation saved on this device. No email was sent."
    );
    setNotificationOpen(true);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<EventIcon />}
        onClick={handleOpen}
      >
        Invite for Interview
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Schedule Candidate Interview</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Candidate"
            value={candidateName}
            margin="normal"
            slotProps={{
              input: { readOnly: true },
            }}
          />

          <TextField
            fullWidth
            required
            type="date"
            label="Interview Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
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
            label="Interview Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            margin="normal"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="interview-type-label">
              Interview Type
            </InputLabel>

            <Select
              labelId="interview-type-label"
              name="type"
              value={formData.type}
              label="Interview Type"
              onChange={handleChange}
            >
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="In-person">In-person</MenuItem>
              <MenuItem value="Phone">Phone</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.date || !formData.time}
          >
            Save Interview
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationOpen(false)}
      >
        <Alert
          severity="success"
          onClose={() => setNotificationOpen(false)}
        >
          {notification}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InterviewInvite;