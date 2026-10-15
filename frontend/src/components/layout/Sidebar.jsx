import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import EventIcon from "@mui/icons-material/Event";

import { useAuth } from "../../context/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/dashboard",
    },
    {
      text: "Jobs",
      icon: <WorkIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/jobs",
    },
    {
      text: "Applications",
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/applications",
    },
    {
      text: "Kanban Board",
      icon: <ViewKanbanIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/kanban",
    },
    {
      text: "Candidate Rankings",
      icon: <BarChartIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/ranking",
    },
    {
      text: "Interviews",
      icon: <EventIcon sx={{ fontSize: 20 }} />,
      path: "/recruiter/interviews",
    },
  ];

  const handleLogout = () => {
    onMobileClose?.();
    logout();
    navigate("/recruiter/login", { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "100%", md: "calc(100vh - 64px)" },
        p: 1.5,
      }}
    >
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          gap: 1.5,
          px: 1,
          py: 1.5,
          mb: 1,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF",
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          I
        </Box>
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#0F172A" }}>
          IntelliHire
        </Typography>
      </Box>

      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={onMobileClose}
                selected={isActive}
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  px: 1.5,
                  backgroundColor: isActive ? "#EEF2FF" : "transparent",
                  color: isActive ? "#4F46E5" : "#475569",
                  "&.Mui-selected": {
                    backgroundColor: "#EEF2FF",
                    color: "#4F46E5",
                  },
                  "&:hover": {
                    backgroundColor: isActive ? "#E0E7FF" : "#F8FAFC",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? "#4F46E5" : "#64748B",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1, borderColor: "#F1F5F9" }} />

      <ListItem disablePadding sx={{ pb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "10px",
            py: 1,
            px: 1.5,
            color: "#EF4444",
            "&:hover": { backgroundColor: "#FEF2F2" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "#EF4444" }}>
            <LogoutIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600 }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "64px",
            height: "calc(100% - 64px)",
            borderRight: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
