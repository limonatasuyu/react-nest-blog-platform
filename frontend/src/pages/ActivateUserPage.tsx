import { useState } from "react";
import LoginLayout from "../Layouts/LoginLayout";
import { TextField, Typography, Button, Box, AlertColor } from "@mui/material";
import useTimer from "../hooks/useTimer";
import useSnackbar from "../hooks/useSnackbar";

export default function ActivateUserPage() {
  const { timeLeft, formatTime, reInitalize } = useTimer(5 * 60);
  const { setSnackBar } = useSnackbar();

  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingNewRequest, setIsSubmittingNewRequest] = useState(false);

  const params = new URL(document.location.toString()).searchParams;
  const userId = params.get("user_id");

  if (!userId) {
    setTimeout(() => {
      window.location.pathname = "/login";
    }, 4000);
    return <div>Some error happened</div>;
  }

  function handleSubmit() {
    if (!textValue || textValue.length < 6) {
      setError("Invalid Code");
      return;
    }
    setIsSubmitting(true);

    fetch(`${process.env.REACT_APP_API_URL}user/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        activationCode: textValue,
      }),
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        const message = jsonResponse.message;
        let status: AlertColor;
        if (res.ok) {
          status = "success";
          setTimeout(() => {
            window.location.pathname = "/";
          }, 3000);
        } else {
          status = "error";
        }

        setSnackBar(message, status);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Please try again later", "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleRequestNewCode() {
    setIsSubmittingNewRequest(true);
    fetch(`${process.env.REACT_APP_API_URL}user/recreate-activation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
      }),
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        const message = jsonResponse.message;
        let status: AlertColor;
        if (res.ok) {
          reInitalize();
          status = "success";
        } else {
          status = "error";
        }

        setSnackBar(message, status);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Please try again later", "error");
      })
      .finally(() => {
        setIsSubmittingNewRequest(false);
      });
  }

  return (
    <LoginLayout>
      <Box
        display="flex"
        sx={{ alignItems: "center", flexDirection: "column" }}
      >
        <Typography color="black">We sent you an activation code</Typography>
        <TextField
          sx={{ mt: 2, mb: 2 }}
          value={textValue}
          type="text"
          error={Boolean(error)}
          helperText={error}
          onChange={(e) => {
            if (e.target.value.length <= 6 && !isNaN(Number(e.target.value)))
              setTextValue(e.target.value);
            if (e.target.value.length == 6) setError("");
          }}
        />
        <Box
          display="flex"
          sx={{ alignItems: "start", justifyContent: "center", gap: 1 }}
        >
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            variant="contained"
          >
            Submit
          </Button>

          <Box
            display="flex"
            sx={{ flexDirection: "column", alignItems: "center" }}
          >
            <Button
              disabled={timeLeft > 0 || isSubmittingNewRequest}
              variant="contained"
              onClick={handleRequestNewCode}
            >
              Request new code
            </Button>
            {timeLeft > 0 && (
              <Typography
                color="black"
                variant="subtitle2"
                sx={{ width: "14rem" }}
              >
                Please wait {formatTime(timeLeft)} before requesting a new code
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </LoginLayout>
  );
}
