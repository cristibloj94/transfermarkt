import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          Enter your email address to receive a password reset link.
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Reset Link
          </Button>
        </Box>
        <Button variant="text" size="small" onClick={() => navigate('/login')}>
          Back to Sign In
        </Button>
      </Box>
    </Container>
  );
}

export default ForgotPasswordPage;