
import { useEffect, useMemo, useState } from "react";

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
  TablePagination,
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

const getInterviewTimestamp = (interview) => {
  const { date, time } = interview;

  if (!date) return Number.POSITIVE_INFINITY;

  const dateTime = new Date(`${date}T${time || "23:59"}`);

  return Number.isNaN(dateTime.getTime())
    ? Number.POSITIVE_INFINITY
    : dateTime.getTime();
};

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [rescheduleInterview, setRescheduleInterview] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  // Search, filtering, sorting, and pagination.
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("date-asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load locally saved invitations.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid saved interview data.");
      }

      setInterviews(parsed);
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

  const confirmInterviewAction = () => {
    if (!selectedInterview) return;

    const status =
      selectedInterview.action === "Complete" ? "Completed" : "Cancelled";

    if (updateInvitationStatus(selectedInterview.id, status)) {
      setSelectedInterview(null);
    }
  };

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

    if (
      updateInvitation(rescheduleInterview.id, {
        date: newDate,
        time: newTime,
        status: "Scheduled",
        updatedAt: new Date().toISOString(),
      })
    ) {
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

  // Statistics are calculated from all saved invitations.
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

  const interviewTypes = useMemo(
    () =>
      [
        ...new Set(
          interviews
            .map((interview) => interview.type)
            .filter((type) => typeof type === "string" && type.trim())
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [interviews]
  );

  // Filter first, then sort.
  const filteredInterviews = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return interviews
      .filter((interview) => {
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
      })
      .sort((a, b) => {
        const nameA = String(a.candidateName || "Candidate").trim();
        const nameB = String(b.candidateName || "Candidate").trim();

        const dateA = getInterviewTimestamp(a);
        const dateB = getInterviewTimestamp(b);

        switch (sortOrder) {
          case "date-desc":
            return dateB - dateA;

          case "name-asc":
            return nameA.localeCompare(nameB, undefined, {
              sensitivity: "base",
            });

          case "name-desc":
            return nameB.localeCompare(nameA, undefined, {
              sensitivity: "base",
            });

          case "date-asc":
          default:
            return dateA - dateB;
        }
      });
  }, [interviews, searchTerm, statusFilter, typeFilter, sortOrder]);

  // Reset pagination when the search, filters, or sorting changes.
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, typeFilter, sortOrder]);

  // Keep the current page within range after an interview update.
  useEffect(() => {
    const lastPage = Math.max(
      0,
      Math.ceil(filteredInterviews.length / rowsPerPage) - 1
    );

    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [filteredInterviews.length, rowsPerPage, page]);

  const paginatedInterviews = useMemo(
    () =>
      filteredInterviews.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredInterviews, page, rowsPerPage]
  );

  const handlePageChange = (_event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortOrder("date-asc");
    setPage(0);
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    typeFilter !== "All";

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

          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Interview statistics */}
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

      {/* Search, filters, and sorting */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Search, Filter and Sort Interviews
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "2fr repeat(3, minmax(140px, 1fr)) auto",
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

          <TextField
            select
            fullWidth
            size="small"
            label="Sort by"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <MenuItem value="date-asc">Upcoming first</MenuItem>
            <MenuItem value="date-desc">Latest first</MenuItem>
            <MenuItem value="name-asc">Candidate A–Z</MenuItem>
            <MenuItem value="name-desc">Candidate Z–A</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!filtersActive && sortOrder === "date-asc"}
            sx={{ whiteSpace: "nowrap" }}
          >
            Clear Filters
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing{" "}
          {filteredInterviews.length === 0
            ? 0
            : page * rowsPerPage + 1}
          {"–"}
          {Math.min((page + 1) * rowsPerPage, filteredInterviews.length)} of{" "}
          {filteredInterviews.length} matching interviews ({interviews.length}{" "}
          total)
        </Typography>
      </Paper>

      {/* Interview table */}
      {interviews.length === 0 ? (
        <Alert severity="info">
          No interviews scheduled yet. Open Candidate Ranking and use "Invite
          for Interview" to save an interview invitation.
        </Alert>
      ) : (
        <>
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
                {filteredInterviews.length === 0 ? (
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
                ) : (
                  paginatedInterviews.map((interview) => {
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
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredInterviews.length > 0 && (
            <Paper
              variant="outlined"
              sx={{ mt: 1, borderRadius: 2, overflowX: "auto" }}
            >
              <TablePagination
                component="div"
                count={filteredInterviews.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Interviews per page:"
                showFirstButton
                showLastButton
              />
            </Paper>
          )}
        </>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
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
          <Button onClick={() => setSelectedInterview(null)}>Go Back</Button>

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
