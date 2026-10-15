import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LaunchIcon from "@mui/icons-material/Launch";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Navbar({ onDrawerToggle }) {
  const { user } = useAuth();
  const recruiterName = user?.name || "Recruiter";
  const companyName = user?.companyName || "";

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", height: 64 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              display: { md: "none" },
              color: "#475569",
              mr: 0.5,
              "&:hover": { backgroundColor: "#F1F5F9" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              fontWeight: 800,
              fontSize: "1.1rem",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
            }}
          >
            I
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            IntelliHire
          </Typography>
          <Chip
            label="Recruiter Portal"
            size="small"
            sx={{
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 22,
              ml: 0.5,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            component={Link}
            to="/jobs"
            target="_blank"
            size="small"
            variant="text"
            endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
            sx={{
              color: "#64748B",
              fontSize: "0.8rem",
              fontWeight: 600,
              display: { xs: "none", sm: "inline-flex" },
              "&:hover": { color: "#4F46E5", backgroundColor: "#F8FAFC" },
            }}
          >
            View Careers Site
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {recruiterName.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#0F172A", lineHeight: 1.2 }}>
                {recruiterName}
              </Typography>
              {companyName && (
                <Typography variant="caption" sx={{ color: "#64748B", lineHeight: 1 }}>
                  {companyName}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;