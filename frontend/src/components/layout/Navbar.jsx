import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { recruiter } = useAuth();

  const recruiterName = recruiter?.name?.trim() || "Recruiter";
  const recruiterInitial = recruiterName.charAt(0).toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          IntelliHire
        </Typography>

        <Tooltip title={recruiterName} arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              minWidth: 0,
              maxWidth: { xs: "65%", sm: "auto" },
            }}
          >
            <Avatar
              aria-label={`Profile of ${recruiterName}`}
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                fontSize: { xs: "0.9rem", sm: "1rem" },
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {recruiterInitial}
            </Avatar>

            <Typography
              variant="body1"
              fontWeight={500}
              noWrap
              sx={{
                minWidth: 0,
                maxWidth: { xs: 150, sm: 240 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {recruiterName}
            </Typography>
          </Box>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;