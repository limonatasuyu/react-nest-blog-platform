import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Link,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Paper,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import Layout1 from "../Layout1";
import useSnackbar from "../hooks/useSnackbar";
import placeHolderThumbnail from "/placeholderThumbnail.jpg";

export default function HomePage() {
  const [activeTagTab, setActiveTagTab] = useState("All");
  const [page, setPage] = useState(1);

  const mockTags = ["All", "Technology", "Health", "Finance"];
  const mockPosts = [
    {
      user: "John Doe",
      imageDataUrl: "https://via.placeholder.com/150",
      title: "Understanding React Hooks",
      description:
        "An in-depth look into React Hooks and how they can simplify your code.",
      tags: ["React", "JavaScript", "Web Development"],
    },
    // Add more mock posts here
  ];
  const mockTagsToFollow = ["Science", "Art", "Travel"];
  const mockWhoToFollow = [
    {
      name: "Jane Smith",
      description: "Frontend Developer",
      avatarUrl: "https://via.placeholder.com/40",
    },
    // Add more mock users here
  ];

  const [posts, setPosts] = useState<
    {
      id: string;
      title: string;
      content: string;
      commentCount: number;
      likedCount: number;
      thumbnailId?: string;
      tags: string[];
      user: {
        name: string;
        username: string;
      }
    }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const { setSnackBar } = useSnackbar();

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts?page=${page}`, {
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
  }, [page]);

  if (!loaded) {
    return (
      <Layout1>
        <Box
          display="flex"
          sx={{
            width: "100%",
            height: "80vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3">Loading..</Typography>
        </Box>
      </Layout1>
    );
  }

  return (
    <Layout1>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          gap: 4,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, maxWidth: "800px" }}>
          {/* Tag Tabs */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, overflowX: "auto" }}>
            {mockTags.map((tag, index) => (
              <Button
                key={index}
                variant={activeTagTab === tag ? "contained" : "outlined"}
                color="primary"
                onClick={() => setActiveTagTab(tag)}
              >
                {tag}
              </Button>
            ))}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Posts */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {posts.map((post, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  padding: 3,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                }}
              >
                {/* Post Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <Link
                    href={`/user/${post.user.username}`}
                    underline="hover"
                    color="text.primary"
                    variant="subtitle1"
                    fontWeight="bold"
                  >
                    {post.user.name}
                  </Link>
                </Box>

                {/* Post Content */}
                <Link
                  href={`/post?id=${post.id}`}
                  underline="none"
                  color="inherit"
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={
                      post.thumbnailId
                        ? `http://localhost:5000/image/${post.thumbnailId}`
                        : placeHolderThumbnail
                    }
                    alt={post.title}
                    sx={{
                      width: { xs: "100%", sm: "200px" },
                      height: "auto",
                      borderRadius: 2,
                      objectFit: "cover",
                    }}
                  />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
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
                </Link>

                {/* Post Footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="123 likes" arrow>
                      <IconButton>
                        <FavoriteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="123 comments" arrow>
                      <IconButton>
                        <ChatIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {post.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
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
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", md: "300px" },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            mt: { xs: 4, md: 0 },
          }}
        >
          {/* Recommended Topics */}
          <Paper
            elevation={3}
            sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff" }}
          >
            <Typography variant="h6" gutterBottom>
              Recommended Topics
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {mockTagsToFollow.map((tag, index) => (
                <Chip
                  key={index}
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
            <Link
              href="/tags"
              underline="hover"
              sx={{ display: "block", mt: 2 }}
            >
              See more
            </Link>
          </Paper>

          {/* Who to Follow */}
          <Paper
            elevation={3}
            sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff" }}
          >
            <Typography variant="h6" gutterBottom>
              Who to Follow
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {mockWhoToFollow.map((user, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar src={user.avatarUrl}>{user.name.charAt(0)}</Avatar>
                  <Box>
                    <Link
                      href="/user"
                      underline="hover"
                      color="text.primary"
                      variant="subtitle1"
                      fontWeight="bold"
                    >
                      {user.name}
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      {user.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Link
              href="/users"
              underline="hover"
              sx={{ display: "block", mt: 2 }}
            >
              See more
            </Link>
          </Paper>
        </Box>
      </Box>
    </Layout1>
  );
}
