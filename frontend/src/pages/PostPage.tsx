import { Box, TextField, Typography, Button, Avatar } from "@mui/material";
import Layout1 from "../Layout1";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import useSnackbar from "../hooks/useSnackbar";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { marked } from "marked";
import { AccountCircle as AccountCircleIcon } from "@mui/icons-material";

export default function PostPage() {
  const params = new URL(document.location.toString()).searchParams;
  const postId = params.get("id");

  const [post, setPost] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSnackBar } = useSnackbar();

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later.",
            "error"
          );
          return;
        }
        setPost(jsonResponse);
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later.",
          "error"
        )
      )
      .finally(() => setLoaded(true));
  }, []);

  function handleSubmit() {
    const token = window.sessionStorage.getItem("access_token");
    setIsSubmitting(true);
    fetch(`http://localhost:5000/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-type": "application/json" },
      body: JSON.stringify({ postId, content: comment }),
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
        setSnackBar(
          jsonResponse.message ?? "Comment added successfully.",
          "success"
        );
        setComment("");
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        )
      )
      .finally(() => setIsSubmitting(false));
  }

  if (!loaded) return <Loading />;

  return (
  <Layout1>
  <Box
    sx={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: 3,
    }}
  >
    <Box sx={{ width: { xs: "90%", md: "60%" }, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        {post?.title}
      </Typography>
      <img
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          objectFit: "cover",
          marginBottom: "1.5rem",
        }}
        src={
          post?.thumbnailId
            ? `http://localhost:5000/image/${post?.thumbnailId}`
            : placeholderThumbnail
        }
        alt="Post Thumbnail"
      />
      <Box
        sx={{
          mt: 3,
          textAlign: "start",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        dangerouslySetInnerHTML={{
          __html: marked.parse(post?.content, {
            async: false,
            breaks: true,
          }),
        }}
      />
    </Box>
  </Box>

  <Box sx={{ width: { xs: "90%", md: "60%" }, margin: "auto", mt: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Comments
    </Typography>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        fullWidth
        value={comment}
        onChange={(e) => {
          if (isSubmitting) return;
          setComment(e.target.value);
        }}
        placeholder="Write a comment..."
      />
      <Button
        variant="contained"
        disabled={!comment.length || isSubmitting}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Box>

    {post?.comments.map((i, x) => (
      <Box key={x} sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              height: "4rem",
              width: "4rem",
              bgcolor: "primary.main",
              boxShadow: 3,
            }}
          >
            {i.user?.profilePictureId ? (
              <Box
                component="img"
                src={`http://localhost:5000/image/${i.user?.profilePictureId}`}
                sx={{ borderRadius: "50%", width: "100%", height: "100%" }}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: "2rem" }} />
            )}
          </Avatar>
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            {i.user?.name || "Anonymous"}
          </Typography>
        </Box>
        <Typography>{i.content}</Typography>
      </Box>
    ))}
  </Box>
</Layout1>

  );
}
