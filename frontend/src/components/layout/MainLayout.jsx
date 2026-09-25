import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const drawerWidth = 240;

function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Box sx={{ mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;