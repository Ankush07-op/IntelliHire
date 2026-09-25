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
import BarChartIcon from "@mui/icons-material/BarChart";
import LoginIcon from "@mui/icons-material/Login";

import { Link } from "react-router-dom";

const drawerWidth = 240;

function Sidebar() {
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Jobs",
      icon: <WorkIcon />,
      path: "/jobs",
    },
    {
      text: "Applications",
      icon: <PeopleIcon />,
      path: "/applications",
    },
    {
      text: "Ranking",
      icon: <BarChartIcon />,
      path: "/ranking",
    },
  ];

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

          {/* Login */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/login"
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>

              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;