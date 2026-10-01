import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";

const initialCandidates = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    job: "Frontend Developer",
    status: "Pending",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya.singh@gmail.com",
    job: "Frontend Developer",
    status: "Shortlisted",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@gmail.com",
    job: "Backend Developer",
    status: "Interview",
  },
  {
    id: 4,
    name: "Neha Verma",
    email: "neha.verma@gmail.com",
    job: "Backend Developer",
    status: "Pending",
  },
  {
    id: 5,
    name: "Arjun Patel",
    email: "arjun.patel@gmail.com",
    job: "Full Stack Developer",
    status: "Shortlisted",
  },
  {
    id: 6,
    name: "Sneha Gupta",
    email: "sneha.gupta@gmail.com",
    job: "Frontend Developer",
    status: "Rejected",
  },
];

const columns = [
  {
    id: "Pending",
    title: "Pending",
  },
  {
    id: "Shortlisted",
    title: "Shortlisted",
  },
  {
    id: "Interview",
    title: "Interview",
  },
  {
    id: "Rejected",
    title: "Rejected",
  },
];

function Kanban() {
  const [candidates, setCandidates] = useState(
    initialCandidates
  );

  const [draggedCandidateId, setDraggedCandidateId] =
    useState(null);

  const [dragOverColumn, setDragOverColumn] =
    useState(null);

  const getColumnCount = (status) => {
    return candidates.filter(
      (candidate) => candidate.status === status
    ).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "success";

      case "Interview":
        return "info";

      case "Rejected":
        return "error";

      case "Pending":
        return "warning";

      default:
        return "default";
    }
  };

  const handleDragStart = (candidateId) => {
    setDraggedCandidateId(candidateId);
  };

  const handleDragEnd = () => {
    setDraggedCandidateId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (
    event,
    columnId
  ) => {
    event.preventDefault();

    setDragOverColumn(columnId);
  };

  const handleDragLeave = (
    event,
    columnId
  ) => {
    /*
     * Only clear the highlighted column when
     * the pointer actually leaves the column.
     */
    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (
    event,
    columnId
  ) => {
    event.preventDefault();

    if (!draggedCandidateId) {
      return;
    }

    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) =>
        candidate.id === draggedCandidateId
          ? {
              ...candidate,
              status: columnId,
            }
          : candidate
      )
    );

    setDraggedCandidateId(null);
    setDragOverColumn(null);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Recruitment Kanban
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Track candidates through the recruitment
          process
        </Typography>
      </Box>

      {/* Drag & Drop Hint */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: "#e3f2fd",
        }}
      >
        <Typography
          variant="body2"
          color="primary.dark"
        >
          Drag and drop candidate cards between columns
          to update their recruitment stage.
        </Typography>
      </Box>

      {/* Kanban Columns */}
      <Grid container spacing={2}>
        {columns.map((column) => {
          const columnCandidates =
            candidates.filter(
              (candidate) =>
                candidate.status === column.id
            );

          const isDragOver =
            dragOverColumn === column.id;

          return (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
              key={column.id}
            >
              <Box
                onDragOver={(event) =>
                  handleDragOver(
                    event,
                    column.id
                  )
                }
                onDragLeave={(event) =>
                  handleDragLeave(
                    event,
                    column.id
                  )
                }
                onDrop={(event) =>
                  handleDrop(
                    event,
                    column.id
                  )
                }
                sx={{
                  backgroundColor: isDragOver
                    ? "#e8f5e9"
                    : "#f5f7fa",
                  borderRadius: 2,
                  minHeight: 500,
                  p: 2,
                  border: isDragOver
                    ? "2px dashed #4caf50"
                    : "2px solid transparent",
                  transition:
                    "all 0.2s ease",
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                  >
                    {column.title}
                  </Typography>

                  <Chip
                    label={getColumnCount(
                      column.id
                    )}
                    size="small"
                    color={getStatusColor(
                      column.id
                    )}
                  />
                </Box>

                {/* Candidate Cards */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {columnCandidates.map(
                    (candidate) => (
                      <Card
                        key={candidate.id}
                        draggable
                        onDragStart={() =>
                          handleDragStart(
                            candidate.id
                          )
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        elevation={1}
                        sx={{
                          borderRadius: 2,
                          cursor:
                            draggedCandidateId ===
                            candidate.id
                              ? "grabbing"
                              : "grab",
                          opacity:
                            draggedCandidateId ===
                            candidate.id
                              ? 0.5
                              : 1,
                          transform:
                            draggedCandidateId ===
                            candidate.id
                              ? "scale(0.98)"
                              : "scale(1)",
                          transition:
                            "all 0.2s ease",
                          "&:hover": {
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent>
                          {/* Candidate Name */}
                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <PersonIcon
                              fontSize="small"
                              color="action"
                            />

                            <Typography
                              fontWeight={600}
                            >
                              {
                                candidate.name
                              }
                            </Typography>
                          </Box>

                          {/* Email */}
                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <EmailIcon
                              fontSize="small"
                              color="action"
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {
                                candidate.email
                              }
                            </Typography>
                          </Box>

                          {/* Job */}
                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <WorkIcon
                              fontSize="small"
                              color="action"
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {candidate.job}
                            </Typography>
                          </Box>

                          {/* Status */}
                          <Chip
                            label={
                              candidate.status
                            }
                            color={getStatusColor(
                              candidate.status
                            )}
                            size="small"
                          />
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/* Empty Column */}
                  {columnCandidates.length ===
                    0 && (
                    <Box
                      sx={{
                        border:
                          "1px dashed #bbb",
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No candidates
                      </Typography>

                      {draggedCandidateId && (
                        <Typography
                          variant="caption"
                          color="primary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Drop candidate here
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Kanban;