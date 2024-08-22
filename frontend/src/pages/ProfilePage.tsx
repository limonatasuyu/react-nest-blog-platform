import { Box, TextField, Button, Avatar, Paper } from "@mui/material";
import Layout1 from "../Layout1";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import useSnackbar from "../hooks/useSnackbar";
import Loading from "../components/Loading";
import {
  AccountCircle as AccountCircleIcon,
  Upload as UploadIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<{
    email: string;
    firstname: string;
    lastname: string;
    username: string;
    profilePictureId?: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { setSnackBar } = useSnackbar();
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserInfo = useCallback(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch("http://localhost:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later",
            "error"
          );
          return;
        }
        setUserInfo(jsonResponse);
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        )
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  async function handleImageUpload(image: File) {
    const formData = new FormData();
    formData.append("file", image);
    const token = window.sessionStorage.getItem("access_token");
    const res = await fetch("http://localhost:5000/image", {
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

  function resetForm() {
    setIsSubmitting(false);
    setIsEditing(false);
    setImageId(null);
    setImageDataUri(null);
  }

  function handleSubmit() {
    setIsSubmitting(true);
    const token = window.sessionStorage.getItem("access_token");
    fetch("http://localhost:5000/user/change_picture", {
      method: "PUT",
      body: JSON.stringify({ imageId }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, pleae try again later",
            "error"
          );
          return;
        }
        setSnackBar(
          jsonResponse.message ?? "Profile picture changed successfully",
          "success"
        );
        fetchUserInfo();
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        );
      })
      .finally(() => resetForm());
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    fileToDataUri(file).then((res) => setImageDataUri(res as string));
    handleImageUpload(file).then((res) => {
      if (res?.result) {
        setImageId(res.result);
      }
    });
    e.target.files = null;
    setIsEditing(true);
  }

  if (!loaded) return <Loading />;

  return (
    <Layout1>
      <Box
        display="flex"
        sx={{
          width: "96%",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          p: 3,
          mt: 10,
        }}
      >
        <Paper elevation={4} sx={{ p: 6, maxWidth: 500, width: "100%" }}>
          <Box display="flex" sx={{ justifyContent: "center", mb: 4 }}>
            <Avatar
              sx={{
                height: "8rem",
                width: "8rem",
                bgcolor: "primary.main",
                boxShadow: 3,
              }}
            >
              {userInfo?.profilePictureId || imageDataUri ? (
                <Box
                  component="img"
                  src={
                    imageDataUri ??
                    `http://localhost:5000/image/${userInfo?.profilePictureId}`
                  }
                  sx={{ borderRadius: "50%" }}
                />
              ) : (
                <AccountCircleIcon sx={{ fontSize: "6rem" }} />
              )}
            </Avatar>
          </Box>
          <Box display="flex" sx={{ flexDirection: "column", gap: 3 }}>
            <TextField
              id="email"
              label="Email"
              value={userInfo?.email}
              disabled
              fullWidth
            />
            <TextField
              id="fullname"
              label="Name"
              value={userInfo?.firstname + " " + userInfo?.lastname}
              disabled
              fullWidth
            />
            <TextField
              id="username"
              label="Username"
              value={userInfo?.username}
              disabled
              fullWidth
            />
            <Box
              display="flex"
              sx={{ gap: 2, justifyContent: "center", mt: 4 }}
            >
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    component="label"
                  >
                    Change Image
                    <VisuallyHiddenInput
                      type="file"
                      accept=".png,.jpg"
                      onChange={handleImageChange}
                    />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component="label"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<UploadIcon />}
                  >
                    {userInfo?.profilePictureId ? "Change" : "Add"} Profile
                    Picture
                    <VisuallyHiddenInput
                      type="file"
                      accept=".png,.jpg"
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Button
                    href="/change_password"
                    variant="outlined"
                    fullWidth
                    startIcon={<LockIcon />}
                  >
                    Change Password
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout1>
  );
}
