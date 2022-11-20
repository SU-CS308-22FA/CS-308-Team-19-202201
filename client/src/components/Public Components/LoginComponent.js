import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FFP_API from "../../app/api";
import { UserContext } from "../../contexts/userContext";
import { useContext } from "react";

const theme = createTheme();

export default function LoginComponent() {
  const { user, setUser } = useContext(UserContext);
  const [e, setE] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    setE(false);
    setErrorMessage("");
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const res = await FFP_API.post(
        "/auth",
        {
          email: data.get("email"),
          password: data.get("password"),
        },
        { withCredentials: true }
      );
      setUser(res.data.user);
      alert("You have successfully logged in!");
      navigate("/my/profile/" + res.data.user._id);
    } catch (error) {
      setE(true);
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4">
            Log In
          </Typography>
          <Grid container>
            <Grid item sx={{ mt: 2 }}>
              Don't have an account? <Link href="/signup">{"Sign Up"}</Link>
            </Grid>
          </Grid>
          <Box component="form" onSubmit={handleSubmit}>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {e && (
              <Alert variant="outlined" severity="error">
                {errorMessage}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 4,
                backgroundColor: "#51087E",
                "&:hover": {
                  backgroundColor: "#51087E",
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}