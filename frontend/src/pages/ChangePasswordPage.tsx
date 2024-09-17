import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useSnackbar from "../hooks/useSnackbar";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Token, setStep1Token] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordAgain, setShowNewPasswordAgain] = useState(false);
  const { setSnackBar } = useSnackbar();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  function handleStep1() {
    if (!currentPassword) {
      setSnackBar("Current password is required.", "error");
      return;
    }

    setIsSubmitting(true);
    const token = window.sessionStorage.getItem("access_token");

    fetch(`${https://react-nest-blog-platform-production.up.railway.app:5000/}auth/change_password_one`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({ password: currentPassword }),
    })
      .then((res) =>
        res.json().then((jsonResponse) => ({ ok: res.ok, jsonResponse }))
      )
      .then(({ ok, jsonResponse }) => {
        if (!ok) {
          setSnackBar(
            jsonResponse.message ?? "Unexpected error occurred.",
            "error"
          );
          return;
        }
        setStep1Token(jsonResponse.token);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Unexpected error occurred.", "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleStep2() {
    if (!validatePassword(newPassword)) {
      setSnackBar(
        "Password must be at least 8 characters long, contain an uppercase letter and a number.",
        "error"
      );
      return;
    }

    if (newPassword !== newPasswordAgain) {
      setSnackBar("Passwords do not match.", "error");
      return;
    }

    setIsSubmitting(true);
    const token = window.sessionStorage.getItem("access_token");

    fetch(`${https://react-nest-blog-platform-production.up.railway.app:5000/}auth/change_password_two`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        newPassword,
        newPasswordAgain,
        token: step1Token
      }),
    })
      .then((res) =>
        res.json().then((jsonResponse) => ({ ok: res.ok, jsonResponse }))
      )
      .then(({ ok, jsonResponse }) => {
        if (!ok) {
          setSnackBar(
            jsonResponse.message ?? "Unexpected error occurred.",
            "error"
          );
          return;
        }
        setSnackBar(jsonResponse.message, "success");
        setTimeout(() => {
          window.location.pathname = "/"
        }, 2000)
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Unexpected error occurred.", "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const toggleShowCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowNewPasswordAgain = () =>
    setShowNewPasswordAgain(!showNewPasswordAgain);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100vw", height: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "1.5rem" }}>
          {step1Token ? "Set New Password" : "Change Password"}
        </Typography>
        {!step1Token ? (
          <>
            <TextField
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type={showCurrentPassword ? "text" : "password"}
              label="Current Password"
              variant="outlined"
              sx={{ marginBottom: "1rem" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowCurrentPassword} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              disabled={isSubmitting}
              onClick={handleStep1}
              variant="contained"
              color="primary"
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type={showNewPassword ? "text" : "password"}
              label="New Password"
              variant="outlined"
              sx={{ marginBottom: "1rem" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowNewPassword} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              value={newPasswordAgain}
              onChange={(e) => setNewPasswordAgain(e.target.value)}
              type={showNewPasswordAgain ? "text" : "password"}
              label="Confirm New Password"
              variant="outlined"
              sx={{ marginBottom: "1.5rem" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowNewPasswordAgain} edge="end">
                      {showNewPasswordAgain ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              disabled={isSubmitting}
              onClick={handleStep2}
              variant="contained"
              color="primary"
            >
              Change Password
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
