import { Box, TextField, Button, Typography, Tabs, Tab } from "@mui/material";
import AppLayout from "../Layouts/AppLayout";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { Formik } from "formik";
import { marked } from "marked";
import TagsInput from "../components/TagsInput";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import useSnackbar from "../hooks/useSnackbar";
import { useRoute } from "../context/RouteProvider";

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
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export default function CreatePostPage() {
  const params = new URL(document.location.toString()).searchParams;
  const tagName = params.get("tag");

  const { setSnackBar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [imageDataUri, setImageDataUri] = useState<null | string>(null);
  const { navigate } = useRoute();

  //@ts-expect-error i need the second value
  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };

  function handleValidation(values: {
    title: string;
    content: string;
    tags: string[];
  }) {
    const errors: { title?: string; content?: string; tags?: string } = {};
    if (!values.title) errors.title = "Title is required";
    if (!values.content) errors.content = "Content is required";
    if (!values.tags.length) errors.tags = "Please provide at least one tag";
    console.log("errors: ", errors);
    console.log("values: ", values);
    return errors;
  }

  function handleSubmit(
    values: {
      title: string;
      content: string;
      tags: string[];
      thumbnailId: string | null;
    },
    { setSubmitting }: { setSubmitting: (is: boolean) => void }
  ) {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`${"https://react-nest-blog-platform-production.up.railway.app/"}posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Something went wrong, please try again later.",
            "error"
          );
          return;
        }

        setSnackBar(
          jsonResponse.message ?? "Post created successfully.",
          "success"
        );

        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Something went wrong, please try again later.",
          "error"
        );
      })
      .finally(() => setSubmitting(false));
  }

  async function handleImageUpload(image: File) {
    const formData = new FormData();
    formData.append("file", image);
    const token = window.sessionStorage.getItem("access_token");
    const res = await fetch(`${"https://react-nest-blog-platform-production.up.railway.app/"}image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseJson = await res.json();
    if (!res.ok) {
      setSnackBar(
        responseJson.message ??
          "Error while uploading the image, please try again",
        "error"
      );
    } else {
      return { result: responseJson.imageId };
    }
  }

  return (
    <AppLayout>
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: 3 }}
      >
        Create a New Post
      </Typography>
      <Box
        display="flex"
        sx={{ justifyContent: "center", width: "100%", mb: 3 }}
      >
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Create" />
          <Tab label="Overview" />
        </Tabs>
      </Box>
      <Formik
        initialValues={{
          title: "",
          content: "",
          tags: tagName ? [tagName] : [],
          thumbnailId: null,
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
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {tabValue === 0 && (
              <Box sx={{ maxWidth: "600px", width: "100%", padding: 2 }}>
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
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (!e.target.files || !e.target.files.length) return;
                        const file = e.target.files[0];
                        fileToDataUri(file).then((res) =>
                          setImageDataUri(res as string)
                        );
                        handleImageUpload(file).then((res) => {
                          if (res?.result) {
                            setFieldValue("thumbnailId", res.result);
                          }
                        });
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
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
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
                  error={touched.content && Boolean(errors.content)}
                  helperText={touched.content && errors.content}
                />
                <TagsInput
                  name="tags"
                  values={values.tags}
                  error={touched.tags && errors.tags && String(errors.tags)}
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
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 2,
                }}
              >
                <Box sx={{ width: "50%", textAlign: "center" }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {values.title.length
                      ? values.title
                      : "Title would be in here"}
                  </Typography>
                  <img
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      objectFit: "cover",
                      marginBottom: "2rem",
                    }}
                    src={imageDataUri ?? placeholderThumbnail}
                    alt="Post Thumbnail"
                  />
                  <Box
                    sx={{ mt: 2 }}
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(values.content, {
                        async: false,
                        breaks: true,
                      }),
                    }}
                  />
                </Box>
              </Box>
            )}
          </form>
        )}
      </Formik>
    </AppLayout>
  );
}
