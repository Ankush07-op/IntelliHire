import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { recruiter } = useAuth();

  const recruiterName = recruiter?.name || "Recruiter";

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={600}>
          IntelliHire
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36 }}>
            {recruiterName.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="body1" fontWeight={500}>
            {recruiterName}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;