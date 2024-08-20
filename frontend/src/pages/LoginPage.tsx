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
import Layout2 from "../Layout2";
import useSnackbar from "../hooks/useSnackbar";

export default function LoginPage() {
  const { setSnackBar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

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
        setSnackBar(
          jsonResponse?.message,
          jsonResponse.error ? "error" : "success"
        );

        if (jsonResponse.access_token) {
          window.sessionStorage.setItem(
            "access_token",
            jsonResponse.access_token
          );
          window.location.pathname = "/";
        }
      })
      .catch((err) => {
        setSnackBar(
          JSON.stringify(err) === "{}"
            ? "An unexpected error occured, please try again later."
            : err,
          "error"
        );
      })
      .finally(() => {
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
    </Layout2>
  );
}
