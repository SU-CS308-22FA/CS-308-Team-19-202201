import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Container from "@mui/material/Container";
import { useState, useEffect, useContext } from "react";
import FFP_API from "../../app/api";
import { UserContext } from "../../contexts/userContext";
import { useNavigate } from "react-router-dom";
import CircularProgressComponent from "../Public Components/CircularProgressComponent";

export default function MultiActionAreaCard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [e, setE] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [team, setTeam] = useState(null);
  useEffect(() => {
    const fetchTeamInfo = async () => {
      await FFP_API.get(`/teams/${user.team}`)
        .then((res) => {
          setTeam(res.data);
        })
        .catch((err) => {
          setE(true);
          setErrorMessage(err.message);
        });
    };
    fetchTeamInfo();
  }, [user]);

  const handleUpdateTeam = async () => {
    const options = {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    };
    await FFP_API.patch(
      `/teams/${team._id}`,
      {
        sponsorBudget: 0,
      },
      options
    ).catch((err) => {
      setE(true);
      setErrorMessage(err.message);
    });
  };

  const handleCancelRequest = async () => {
    handleUpdateTeam();
    try {
      await FFP_API.patch(`/users/${user._id}`, {
        team: null,
      });
      alert(
        "You have successfully cancelled the request! The page will be refreshed."
      );
      window.location.reload();
    } catch (error) {
      setE(true);
      setErrorMessage(error.response.data);
    }
  };

  function handleNavigate(teamAdminMail) {
    navigate("/sendnotification", {
      state: { data: teamAdminMail },
    });
  }

  if (team && user) {
    if (user.isSupporting) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Card sx={{ maxWidth: 345 }}>
            <Box
              sx={{
                width: "100%",
              }}
            ></Box>
            <CardActionArea>
              <CardMedia
                component="img"
                height="140"
                image={team.logoURL}
                sx={{ ml: 8, maxWidth: 200 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {team.teamName}
                </Typography>
                <Typography variant="body2">
                  Your request to become a supporter of our team has been
                  approved by the administrator. You will now be providing
                  support to the team with a budget of {team.sponsorBudget} Mil.
                  TL for this season. Thank you for your support!
                </Typography>
                <Typography variant="body2">
                  Click the button to send a notification to the team admin.
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => navigate(`/teams/${team._id}`)}
              >
                Team Page
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => handleNavigate(team.admin)}
              >
                Send notification
              </Button>

              {e && (
                <Alert variant="outlined" severity="error">
                  {errorMessage}
                </Alert>
              )}
            </CardActions>
          </Card>
        </Box>
      );
    } else if (!user.isSupporting) {
      return (
        <>
          <Typography variant="h4" component="div" align="center" mt={4}>
            Current Status of Your Request
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={10}
          >
            <Card sx={{ maxWidth: 345 }}>
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <LinearProgress />
              </Box>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={team.logoURL}
                  //alt="green iguana"s
                  sx={{ maxWidth: 200, mt: 2, ml: 10 }}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    align="center"
                  >
                    {team.teamName}
                  </Typography>
                  <Typography variant="body2">
                    Your request to join our team as a supporter is being
                    reviewed by the team admin. Thank you for your interest.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Container maxWidth="lg">
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/teams/${team._id}`)}
                  >
                    Team Page
                  </Button>
                  <Button
                    onClick={handleCancelRequest}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ ml: 4 }}
                  >
                    Cancel request
                  </Button>
                </Container>
                {e && (
                  <Alert variant="outlined" severity="error">
                    {errorMessage}
                  </Alert>
                )}
              </CardActions>
            </Card>
          </Box>
        </>
      );
    }
  } else {
    <Container sx={{ ml: 10 }}>
      <CircularProgressComponent />
    </Container>;
  }
}
