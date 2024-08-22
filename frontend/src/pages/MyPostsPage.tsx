import { useState, useEffect } from "react";
import Layout1 from "../Layout1";
import {
  Box,
  Link,
  Typography,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import useSnackbar from "../hooks/useSnackbar";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { SentimentDissatisfied } from "@mui/icons-material";
import Loading from "../components/Loading";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<{
      title: string;
      content: string;
      commentCount: number;
      likedCount: number;
      thumbnailId?: string;
      tags: string[];
    }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const { setSnackBar } = useSnackbar();

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch("http://localhost:5000/posts/my_posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Something went wrong, please try again later",
            "error"
          );
          return;
        }
        setPosts(jsonResponse);
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Something went wrong, please try again later",
          "error"
        );
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <Loading />;

  return (
    <Layout1>
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          mt: 8,
          px: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Your Posts
        </Typography>
        {posts.length ? (
          posts.map((post, index) => (
            <Box
              key={index}
              sx={{
                mb: 4,
                p: 2,
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Link
                href={`/post/${post.id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    component="img"
                    src={
                      post.thumbnailId
                        ? `http://localhost:5000/image/${post.thumbnailId}`
                        : placeholderThumbnail
                    }
                    sx={{
                      width: "100px",
                      height: "100px",
                      borderRadius: 1,
                      mr: 2,
                      objectFit: "cover",
                    }}
                    alt="Post thumbnail"
                  />
                  <Box>
                    <Typography variant="h6">{post.title}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2, // Limit to 2 lines of text
                      }}
                    >
                      {post.content}
                    </Typography>
                  </Box>
                </Box>
              </Link>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Tooltip title={`${post.likedCount} likes`} arrow>
                    <IconButton disableRipple>
                      <FavoriteIcon color="primary" sx={{ mr: 1 }} />
                      {post.likedCount}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`${post.commentCount} comments`} arrow>
                    <IconButton disableRipple>
                      <ChatIcon color="primary" sx={{ mr: 1 }} />
                      {post.commentCount}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {post.tags.map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      label={tag}
                      component="a"
                      href={`/tags/${tag}`}
                      clickable
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box
            display="flex"
            sx={{
              fontSize: "50px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              borderRadius: 2,
              color: "gray",
              backgroundColor: "#c9c9c9",
              py: 2
            }}
          >
            <SentimentDissatisfied sx={{ fontSize: "inherit" }} />
            <Typography sx={{ fontSize: "inheriinheritt" }}>
              No articles found.
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Link
            href="/create_post"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src={placeholderThumbnail}
                sx={{
                  width: "100px",
                  height: "100px",
                  borderRadius: 1,
                  mr: 2,
                  objectFit: "cover",
                }}
                alt="Post thumbnail"
              />
              <Box>
                <Typography variant="h6">{"Write a new article"}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2, // Limit to 2 lines of text
                  }}
                >
                  Write what you think
                </Typography>
              </Box>
            </Box>
          </Link>
        </Box>
      </Box>
    </Layout1>
  );
}
