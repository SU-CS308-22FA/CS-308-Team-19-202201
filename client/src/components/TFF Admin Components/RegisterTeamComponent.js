import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import FFP_API from "../../app/api";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

const theme = createTheme();

export default function RegisterTeamComponent() {
  const { id } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [e, setE] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validate = (data) => {
    let error = "";
    if (data.get("seasonBudget") <= 0) {
      error = "Season budget must be greater than 0.";
    }
    return error;
  };

  const handleNewTeam = async (e) => {
    e.preventDefault();
    setE(false);
    setErrorMessage("");
    const data = new FormData(e.currentTarget);
    const result = validate(data);
    if (result !== "") {
      setE(true);
      setErrorMessage(result);
    } else {
      try {
        await FFP_API.post(`/teams`, {
          teamName: data.get("teamName"),
          seasonBudget: data.get("seasonBudget"),
        });
        alert("Team created successfully!");
        navigate(`/`);
      } catch (error) {
        setE(true);
        setErrorMessage(error.response.data.error);
      }
    }
  };

  return (
    <>
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
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Register A New Team to the System
            </Typography>
            <Box component="form" onSubmit={handleNewTeam}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    name="teamName"
                    fullWidth
                    id="teamName"
                    label="Team Name"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    id="seasonBudget"
                    label="Season Budget"
                    name="seasonBudget"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }} />
              {e && (
                <Alert variant="outlined" severity="error">
                  {errorMessage}
                </Alert>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 4 }}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}