import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

import {
  getApplications,
  updateApplicationStatus,
} from "../../services/applicationStore";

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
  const [applications, setApplications] = useState([]);
  const [draggedApplication, setDraggedApplication] =
    useState(null);
  const [draggedOverColumn, setDraggedOverColumn] =
    useState(null);

  useEffect(() => {
    setApplications(getApplications());

    const handleApplicationsUpdated = (event) => {
      setApplications(event.detail);
    };

    window.addEventListener(
      "applicationsUpdated",
      handleApplicationsUpdated
    );

    return () => {
      window.removeEventListener(
        "applicationsUpdated",
        handleApplicationsUpdated
      );
    };
  }, []);

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

  const handleDragStart = (application) => {
    setDraggedApplication(application);
  };

  const handleDragEnd = () => {
    setDraggedApplication(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (event, columnId) => {
    event.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();

    if (!draggedApplication) {
      return;
    }

    if (draggedApplication.status === columnId) {
      handleDragEnd();
      return;
    }

    const updatedApplications =
      updateApplicationStatus(
        draggedApplication.id,
        columnId
      );

    setApplications(updatedApplications);

    setDraggedApplication(null);
    setDraggedOverColumn(null);
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
          Track candidates through the recruitment process
        </Typography>
      </Box>

      {/* Kanban Columns */}
      <Grid container spacing={2}>
        {columns.map((column) => {
          const columnApplications =
            applications.filter(
              (application) =>
                application.status === column.id
            );

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
                  handleDragOver(event, column.id)
                }
                onDragLeave={handleDragLeave}
                onDrop={(event) =>
                  handleDrop(event, column.id)
                }
                sx={{
                  backgroundColor:
                    draggedOverColumn === column.id
                      ? "#e3f2fd"
                      : "#f5f7fa",
                  borderRadius: 2,
                  minHeight: 500,
                  p: 2,
                  transition:
                    "background-color 0.2s ease",
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                    label={columnApplications.length}
                    size="small"
                    color={getStatusColor(column.id)}
                  />
                </Box>

                {/* Candidate Cards */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minHeight: 400,
                  }}
                >
                  {columnApplications.map(
                    (application) => (
                      <Card
                        key={application.id}
                        draggable
                        onDragStart={() =>
                          handleDragStart(application)
                        }
                        onDragEnd={handleDragEnd}
                        elevation={1}
                        sx={{
                          borderRadius: 2,
                          cursor: "grab",
                          "&:hover": {
                            boxShadow: 4,
                          },
                          "&:active": {
                            cursor: "grabbing",
                          },
                        }}
                      >
                        <CardContent>
                          {/* Candidate Name */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
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
                              {application.candidate}
                            </Typography>
                          </Box>

                          {/* Email */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
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
                              {application.email}
                            </Typography>
                          </Box>

                          {/* Job */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
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
                              {application.job}
                            </Typography>
                          </Box>

                          {/* Status */}
                          <Chip
                            label={application.status}
                            color={getStatusColor(
                              application.status
                            )}
                            size="small"
                          />
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/* Empty Column */}
                  {columnApplications.length ===
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