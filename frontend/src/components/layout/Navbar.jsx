import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

function Navbar() {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          IntelliHire
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2">
          Recruiter Portal
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;