import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../../context/useAuth";
import { Link, useNavigate } from "react-router-dom";

const drawerWidth = 240;

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Jobs",
      icon: <WorkIcon />,
      path: "/recruiter/jobs",
    },
    {
      text: "Applications",
      icon: <PeopleIcon />,
      path: "/recruiter/applications",
    },
    {
      text: "Kanban",
      icon: <ViewKanbanIcon />,
      path: "/kanban",
    },
    {
      text: "Ranking",
      icon: <BarChartIcon />,
      path: "/ranking",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/recruiter/login", { replace: true });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          top: "64px",
        },
      }}
    >
      <Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>

              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;