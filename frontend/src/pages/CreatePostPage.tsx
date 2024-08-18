import {
  Box,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import Layout1 from "../Layout1";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { Formik } from "formik";
import { marked } from "marked";
import TagsInput from "../components/TagsInput";

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

export default function CreatePostPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function handleValidation(values) {}

  function handleSubmit(values, { setSubmitting }) {}

  return (
    <Layout1>
      <Typography variant="h4" component="h1" gutterBottom>
        Create a New Post
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Create" />
        <Tab label="Overview" />
      </Tabs>
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
          setFieldValue
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
                    src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F002%2F206%2F011%2Foriginal%2Farticle-icon-free-vector.jpg&f=1&nofb=1  &ipt=fa94e0c45693f154e6c62e053caa929bcffacf0fc5adb30fd73052091a585691&ipo=images"
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
                    Upload image
                    <VisuallyHiddenInput type="file" />
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
                <Button disabled={isSubmitting} variant="contained" color="primary" fullWidth>
                  Publish Post
                </Button>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6">Overview</Typography>
                <Typography variant="body1">
                  Here you can review your post before publishing. Make sure to
                  fill out all the fields with relevant information.
                </Typography>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(values.content, { async: false }),
                  }}
                />
              </Box>
            )}
          </form>
        )}
      </Formik>
    </Layout1>
  );
}
