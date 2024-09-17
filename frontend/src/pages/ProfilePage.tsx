import {
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Modal,
  Typography,
} from "@mui/material";
import AppLayout from "../Layouts/AppLayout";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import useSnackbar from "../hooks/useSnackbar";
import Loading from "../components/Loading";
import {
  //AccountCircle as AccountCircleIcon,
  Upload as UploadIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CustomLink from "../components/CustomLink";
import { userInfo } from "../interfaces";

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

export default function ProfilePage({
  currentUserName,
}: {
  currentUserName: string;
}) {
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { setSnackBar } = useSnackbar();
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleDescriptionSubmit() {
    setDescriptionTouched(true);
    if (description.length < 5 || description.length > 25) {
      setDescriptionError(
        "Description must be at least 5, at most 25 charcters"
      );
      return;
    }

    const token = window.sessionStorage.getItem("access_token");
    fetch(`${"react-nest-blog-platform-production.up.railway.app"}user/change_description`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({ description }),
    })
      .then((res) => {
        if (!res.ok) {
          res
            .json()
            .then((res) =>
              setSnackBar(res.message ?? "Unexpected error occured", "error")
            );
          return;
        }
        setSnackBar("Description changed successully.", "success");
      })
      .catch((err) =>
        setSnackBar(err.message ?? "Unexpected error occured", "error")
      );
  }

  const fetchUserInfo = useCallback(() => {
    if (!currentUserName) return;
    const token = window.sessionStorage.getItem("access_token");
    fetch(`${"react-nest-blog-platform-production.up.railway.app"}user/profile/${currentUserName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        setDescription(jsonResponse.description);
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        )
      )
      .finally(() => setLoaded(true));
  }, [currentUserName]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo, currentUserName]);

  async function handleImageUpload(image: File) {
    const formData = new FormData();
    formData.append("file", image);
    const token = window.sessionStorage.getItem("access_token");
    const res = await fetch(`${"react-nest-blog-platform-production.up.railway.app"}image`, {
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
    fetch(`${"react-nest-blog-platform-production.up.railway.app"}user/change_picture`, {
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
    <AppLayout>
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
              src={
                imageDataUri ??
                `${"react-nest-blog-platform-production.up.railway.app"}image/${userInfo?.profilePictureId}`
              }
              sx={{ width: "8rem", height: "8rem" }}
            >
              {userInfo?.firstname.charAt(0)}
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

            <TextField
              id="description"
              label="Description"
              placeholder="Little description of who you are"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (!descriptionTouched) return;
                if (description.length < 5 || description.length > 25) {
                  setDescriptionError(
                    "Description must be at least 5, at most 25 charcters"
                  );
                } else {
                  setDescriptionError("");
                }
              }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button onClick={handleDescriptionSubmit}>Submit</Button>
                ),
              }}
              error={Boolean(descriptionError)}
              helperText={descriptionError}
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
                    onClick={() => setIsModalOpen(true)}
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
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography>You can change your password once a month</Typography>
            <CustomLink to="/change_password">
              <Button>Go change it</Button>
            </CustomLink>
          </Box>
        </Modal>
      </Box>
    </AppLayout>
  );
}
