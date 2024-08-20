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
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import useSnackbar from "../hooks/useSnackbar";

export default function SignUpPage() {
  const { setSnackBar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);

  function handleClickShowPasswordAgain() {
    setShowPasswordAgain((show) => !show);
  }

  function handleMouseDownPasswordAgain(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
  }

  function handleClickShowPassword() {
    setShowPassword((show) => !show);
  }

  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  const ThirteenYearsAgo = dayjs().subtract(13, "year");
  function handleValidation(values: any) {
    const errors: any = {};
    if (!values.firstname) {
      errors.firstname = "First name is required";
    }
    if (!values.lastname) {
      errors.lastname = "Last name is required";
    }
    if (!values.username) {
      errors.username = "Username is required";
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = "Invalid date";
    }

    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (values.email !== values.emailAgain) {
      errors.emailAgain = "Emails do not match";
    }
    if (values.password !== values.passwordAgain) {
      errors.passwordAgain = "Passwords do not match";
    }

    if (!values.password) {
      errors.password = "Pasword is required";
    } else if (values.password.length <= 2 || values.password.length >= 16) {
      errors.password = "Password is not valid.";
    }
    return errors;
  }

  function handleSubmit(
    values: any,
    { setSubmitting }: { setSubmitting: (is: boolean) => void }
  ) {
    fetch("http://localhost:5000/user/sign", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        password: values.password,
        dateOfBirth: values.dateOfBirth.toDate(),
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        setSnackBar(
          jsonResponse?.message,
          jsonResponse.error ? "error" : "success"
        );

        if (res.ok && jsonResponse.user_id) {
          window.location.href = `/activate?user_id=${jsonResponse.user_id}`;
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
        initialValues={{
          firstname: "",
          lastname: "",
          username: "",
          email: "",
          emailAgain: "",
          password: "",
          passwordAgain: "",
          dateOfBirth: null,
        }}
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
          setFieldValue,
        }) => (
          <form
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            onSubmit={handleSubmit}
          >
            <Box
              display="grid"
              sx={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}
            >
              <TextField
                id="firstname"
                label="First Name"
                onChange={handleChange}
                value={values.firstname}
                error={Boolean(errors.firstname) && touched.firstname}
                helperText={touched.firstname && errors.firstname}
              />
              <TextField
                id="lastname"
                label="Last Name"
                onChange={handleChange}
                value={values.lastname}
                error={Boolean(errors.lastname) && touched.lastname}
                helperText={touched.lastname && errors.lastname}
              />
              <TextField
                id="username"
                label="Username"
                onChange={handleChange}
                value={values.username}
                error={Boolean(errors.username) && touched.username}
                helperText={touched.username && errors.username}
              />
              <DatePicker
                label="Date Of Birth"
                value={values.dateOfBirth}
                onChange={(val) => setFieldValue("dateOfBirth", val)}
                maxDate={ThirteenYearsAgo}
                slotProps={{
                  textField: {
                    helperText: touched.dateOfBirth && errors.dateOfBirth,
                    error: Boolean(errors.dateOfBirth) && touched.dateOfBirth,
                  },
                }}
              />
              <TextField
                id="email"
                label="Email"
                onChange={handleChange}
                value={values.email}
                error={Boolean(errors.email) && touched.email}
                helperText={touched.email && errors.email}
              />
              <TextField
                id="emailAgain"
                label="Email Again"
                onChange={handleChange}
                value={values.emailAgain}
                error={Boolean(errors.emailAgain) && touched.emailAgain}
                helperText={touched.emailAgain && errors.emailAgain}
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
              <FormControl variant="outlined">
                <InputLabel
                  htmlFor="passwordAgain"
                  error={Boolean(errors.passwordAgain) && touched.passwordAgain}
                >
                  Password Again
                </InputLabel>
                <OutlinedInput
                  error={Boolean(errors.passwordAgain) && touched.passwordAgain}
                  inputProps={{
                    id: "passwordAgain",
                    value: values.passwordAgain,
                    //error: Boolean(errors.password) && touched.password,
                    onChange: handleChange,
                  }}
                  type={showPasswordAgain ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPasswordAgain}
                        onMouseDown={handleMouseDownPasswordAgain}
                        edge="end"
                      >
                        {showPasswordAgain ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password Again"
                />
                <FormHelperText error>
                  {touched.passwordAgain && errors.passwordAgain}
                </FormHelperText>
              </FormControl>
            </Box>
            <Link href="/login">Already have an account ?</Link>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              color="success"
              sx={{ width: "fit-content", alignSelf: "center", mt: 2 }}
            >
              Signup
            </Button>
          </form>
        )}
      </Formik>
    </Layout2>
  );
}
