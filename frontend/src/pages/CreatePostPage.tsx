import { Box, TextField, Button, Typography, Tabs, Tab, AlertColor } from "@mui/material";
import Layout1 from "../Layout1";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { Formik } from "formik";
import { marked } from "marked";
import TagsInput from "../components/TagsInput";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import useSnackbar from "../hooks/useSnackbar";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function fileToDataUri(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Load event triggers when the reading is complete
    reader.onload = () => resolve(reader.result);

    // Error event triggers if something goes wrong
    reader.onerror = (error) => reject(error);

    // Read the file as a Data URL (base64 string)
    reader.readAsDataURL(file);
  });
}

export default function CreatePostPage() {

  const { setSnackBar } = useSnackbar()
  const [tabValue, setTabValue] = useState(0);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function handleValidation(values: {
    title: string;
    content: string;
    tags: string[];
  }) {
    const errors: { title?: string; content?: string; tags?: string } = {};
    if (!values.title) {
      errors.title = "Title is required";
    }
    if (!values.content) {
      errors.content = "Content is required";
    }

    if (!values.tags.length) {
      errors.tags = "Please provide at least one tag";
    }
    return errors;
  }

  function handleSubmit(
    values: { title: string; content: string; tags: string[] },
    { setSubmitting }: { setSubmitting: (is: boolean) => void }
  ) {
    const token = window.sessionStorage.getItem("access_token");
    fetch("http://localhost:5000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    })
      .then(async (res) => {
        const jsonResponse = await res.json()        
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
        setSnackBar(err.message ?? "Something went wrong, please try again later.", "error")
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Layout1>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mt: 2 }}
      >
        Create a New Post
      </Typography>
      <Box display="flex" sx={{ justifyContent: "center", width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3, display: "flex", justifyContent: "center" }}
        >
          <Tab label="Create" />
          <Tab label="Overview" />
        </Tabs>
      </Box>
      <Formik
        initialValues={{ title: "", content: "", tags: [], image: null }}
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
            {tabValue === 0 && (
              <Box sx={{ maxWidth: "600px", margin: "auto" }}>
                <Box sx={{ mb: 2, position: "relative", textAlign: "center" }}>
                  <img
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                    src={imageDataUri ?? placeholderThumbnail}
                    alt="Post Thumbnail"
                  />
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    {imageDataUri ? "Change the" : "Upload"} image
                    <VisuallyHiddenInput
                      type="file"
                      accept=".png,.jpg"
                      onChange={(e) => {
                        console.log("val: ", values);
                        if (!e.target.files || !e.target.files.length) return;
                        setFieldValue(
                          "image", e.target.files[0]
                        );
                        fileToDataUri(e.target.files[0]).then(res => setImageDataUri(res as string))
                        e.target.files = null;
                      }}
                    />
                  </Button>
                </Box>

                <TextField
                  id="title"
                  label="Title"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={values.title}
                  onChange={handleChange}
                />
                <TextField
                  id="content"
                  label="Content"
                  variant="outlined"
                  multiline
                  rows={6}
                  fullWidth
                  sx={{ mb: 2 }}
                  value={values.content}
                  onChange={handleChange}
                />
                <TagsInput
                  name="tags"
                  values={values.tags}
                  error={String(errors.tags)}
                  touched={Boolean(touched.tags)}
                  setFieldValue={setFieldValue}
                />
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  sx={{ mt: 1, mb: 2 }}
                >
                  Publish Post
                </Button>
              </Box>
            )}

            {tabValue === 1 && (
              <Box
                sx={{
                  width: "100",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "50%" }}>
                  <Box sx={{ mt: 2, mb: 4 }}>
                    <h1 style={{ textAlign: "center" }}>
                      {values.title.length
                        ? values.title
                        : "Title would be in here"}
                    </h1>

                    <img
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        objectFit: "cover",
                        marginTop: "2rem",
                      }}
                      src={imageDataUri ?? placeholderThumbnail}
                      alt="Post Thumbnail"
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        marginTop: "2rem",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(values.content, {
                          async: false,
                          breaks: true,
                        }),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </form>
        )}
      </Formik>
    </Layout1>
  );
}
