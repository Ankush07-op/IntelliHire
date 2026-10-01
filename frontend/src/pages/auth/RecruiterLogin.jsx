import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function RecruiterLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const savedAccount = localStorage.getItem("recruiterAccount");

    if (!savedAccount) {
      setError("No recruiter account found. Please register first.");
      return;
    }

    const recruiter = JSON.parse(savedAccount);

    const enteredEmail = email.trim().toLowerCase();

    if (
      enteredEmail !== recruiter.email ||
      password !== recruiter.password
    ) {
      setError("Invalid email or password.");
      return;
    }

    login(recruiter);

    alert("Login successful!");

    navigate("/dashboard", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        px: 2,
      }}
    >
      <Card
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center">
            IntelliHire
          </Typography>

          <Typography variant="h6" textAlign="center" sx={{ mt: 1 }}>
            Recruiter Login
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1, mb: 3 }}
          >
            Sign in to manage your recruitment process
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Login
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              Don't have a recruiter account?{" "}
              <Link href="/register" underline="hover">
                Register
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RecruiterLogin;