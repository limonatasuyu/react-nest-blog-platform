import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  IconButton,
  FormHelperText,
} from "@mui/material";
import login_background from "/login_background.jpg";
import logo_white from "/logo_white.png";
import { Formik } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export default function LoginPage() {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<{
    message: string;
    status: AlertColor;
  }>({ message: "", status: "success" });

  function handleCloseSnackbar(
  ) {
    setIsSnackbarOpen(false);
  }

  function handleClickShowPassword() {
    setShowPassword((show) => !show);
  }

  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  function handleValidation(values: { email?: string; password?: string }) {
    const errors: {
      email?: string;
      password?: string;
    } = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.password) {
      errors.password = "Pasword is required";
    } else if (values.password.length <= 2 || values.password.length >= 16) {
      errors.password = "Password is not valid.";
    }
    return errors;
  }

  function handleSubmit(
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (is: boolean) => void }
  ) {
    fetch("http://localhost:5000/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        setSnackbarMessage({
          message: jsonResponse?.message,
          status: jsonResponse.error ? "error" : "success",
        });
      
        if (jsonResponse.access_token) {
          window.sessionStorage.setItem("access_token", jsonResponse.access_token)
          window.location.pathname = "/"
        }
      })
      .catch((err) => {
        setSnackbarMessage({
          message:
            JSON.stringify(err) === "{}"
              ? "An unexpected error occured, please try again later."
              : err,
          status: "error",
        });
      })
      .finally(() => {
        setIsSnackbarOpen(true);
        setSubmitting(false)
      });
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          backgroundImage: `url(${login_background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100%",
          filter: "blur(5px)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: -1, // Send the background behind the content
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1, // Bring the content to the front
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "white",
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "5px",
            p: 8,
            minWidth: "21rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img src={logo_white} style={{ marginBottom: "2rem" }} />
          <Formik
            initialValues={{ email: "", password: "" }}
            validate={handleValidation}
            onSubmit={handleSubmit}
          >
            {({ values, errors, handleChange, isSubmitting, handleSubmit }) => (
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
                onSubmit={handleSubmit}
              >
                <TextField
                  id="email"
                  label="email"
                  onChange={handleChange}
                  value={values.email}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
                <FormControl variant="outlined">
                  <InputLabel
                    htmlFor="password"
                    error={Boolean(errors.password)}
                  >
                    Password
                  </InputLabel>
                  <OutlinedInput
                    error={Boolean(errors.password)}
                    inputProps={{
                      id: "password",
                      value: values.password,
                      error: Boolean(errors.password),
                      onChange: handleChange,
                    }}
                    type={showPassword ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                  <FormHelperText error>{errors.password}</FormHelperText>
                </FormControl>
                <Box display="flex" sx={{ gap: 2 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="success"
                  >
                    Login
                  </Button>
                  <Button variant="contained">I Lost My Password</Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.status}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {JSON.stringify(snackbarMessage.message)}
        </Alert>
      </Snackbar>
    </Box>
  );
}
