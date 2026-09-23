import { Routes, Route } from "react-router-dom";
import { Box, Typography } from "@mui/material";

function Home() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">
        IntelliHire Recruiter Portal
      </Typography>

      <Typography variant="body1" sx={{ mt: 2 }}>
        Recruiter frontend setup completed.
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;