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
  Link,
} from "@mui/material";
import logo_white from "/logo_white.png";
import { Formik } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";
import Layout2 from "../Layout2";

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

  function handleCloseSnackbar() {
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
          window.sessionStorage.setItem(
            "access_token",
            jsonResponse.access_token
          );
          window.location.pathname = "/";
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
        setSubmitting(false);
      });
  }

  return (
<Layout2>
      <img src={logo_white} style={{ marginBottom: "2rem" }} />
      <Formik
        initialValues={{ email: "", password: "" }}
        validate={handleValidation}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          handleChange,
          isSubmitting,
          handleSubmit,
          touched,
        }) => (
          <form
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            onSubmit={handleSubmit}
          >
            <TextField
              id="email"
              label="email"
              onChange={handleChange}
              value={values.email}
              error={Boolean(errors.email) && touched.email}
              helperText={touched.email && errors.email}
              sx={{ mb: 2 }}
            />
            <FormControl variant="outlined">
              <InputLabel
                htmlFor="password"
                error={Boolean(errors.password) && touched.password}
              >
                Password
              </InputLabel>
              <OutlinedInput
                error={Boolean(errors.password) && touched.password}
                inputProps={{
                  id: "password",
                  value: values.password,
                  //error: Boolean(errors.password) && touched.password,
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
              <FormHelperText error>
                {touched.password && errors.password}
              </FormHelperText>
            </FormControl>
            <Link href="/forget_password">Did you forget your password ?</Link>
            <Box
              display="flex"
              sx={{ gap: 2, justifyContent: "center", mt: 2 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="contained"
                color="success"
              >
                Login
              </Button>
              <Button href="/signup" variant="contained">
                Signup
              </Button>
            </Box>
          </form>
        )}
      </Formik>

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
  </Layout2>
  );
}
