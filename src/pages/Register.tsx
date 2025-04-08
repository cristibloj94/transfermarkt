import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
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
          Sign Up
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
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
        <Grid container>
          <Grid item>
            <Button variant="text" size="small" onClick={() => navigate('/login')}>
              Already have an account? Sign In
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default RegisterPage;