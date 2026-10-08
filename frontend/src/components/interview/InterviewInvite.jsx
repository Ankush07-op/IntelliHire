import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";

const InterviewInvite = ({ candidate }) => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "Online",
    message:
      "Please join the interview 5 minutes before the scheduled time.",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.time) {
      return;
    }

    console.log("Interview invitation:", {
      candidate,
      ...formData,
    });

    setOpen(false);
    setSuccess(true);
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
        <DialogTitle>
          Invite Candidate for Interview
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Candidate"
            value={candidate?.candidate || "Candidate"}
            margin="normal"
            InputProps={{
              readOnly: true,
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
            InputLabelProps={{
              shrink: true,
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
            InputLabelProps={{
              shrink: true,
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

          <RadioGroup
            row
            value={formData.type}
            onChange={handleChange}
            name="type"
          >
            <FormControlLabel
              value="Online"
              control={<Radio />}
              label="Online"
            />

            <FormControlLabel
              value="In-person"
              control={<Radio />}
              label="In-person"
            />

            <FormControlLabel
              value="Phone"
              control={<Radio />}
              label="Phone"
            />
          </RadioGroup>

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
          <Button onClick={handleClose}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.date || !formData.time}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
        >
          Interview invitation sent successfully
        </Alert>
      </Snackbar>
    </>
  );
};

export default InterviewInvite;