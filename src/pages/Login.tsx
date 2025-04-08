import { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import { login } from "../utils/login";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    await login(email, password);
  };

  return (
    <Container className="login-wrapper" maxWidth="xs">
      <Box className="login-wrapper-box">
        <Typography component="h1" variant="h4" gutterBottom>
          Sign In
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSubmit}
            className="login-submit-button"
          >
            <LoginIcon />
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AuthPage;