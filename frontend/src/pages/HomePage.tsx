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

  const [posts, setPosts] = useState<
    {
      _id: string;
      title: string;
      content: string;
      commentCount: number;
      likedCount: number;
      thumbnailId?: string;
      tags: string[];
      user: {
        firstname: string;
        lastname: string;
        username: string;
        description?: string;
        profilePictureId?: string;
      };
    }[]
  >([]);
  const [tags, setTags] = useState<{ name: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [whoToFollow, setWhoToFollow] = useState<
    {
      username: string;
      firstname: string;
      lastname: string;
      description?: string;
      profilePictureId?: string;
    }[]
  >([]);
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

    fetch("http://localhost:5000/tag").then((res) => {
      if (res.ok) {
        res.json().then((result) => setTags(result));
      }
    });

    fetch("http://localhost:5000/user/recommended").then((res) => {
      if (res.ok) {
        res.json().then((result) => setWhoToFollow(result));
      }
    });
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
            <Button
              variant={activeTagTab === "All" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setActiveTagTab("All")}
            >
              All
            </Button>
            {tags.map((tag, index) => (
              <Button
                key={index}
                variant={activeTagTab === tag.name ? "contained" : "outlined"}
                color="primary"
                onClick={() => setActiveTagTab(tag.name)}
              >
                {tag.name}
              </Button>
            ))}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Posts */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {posts
              .filter((i) => {
                if (activeTagTab === "All") return true;
                return i.tags.find((i_) => i_ === activeTagTab);
              })
              .map((post, index) => (
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

                    <Box>
                      <Link
                        href={`/user?username=${post.user.username}`}
                        underline="hover"
                        color="text.primary"
                        variant="subtitle1"
                        fontWeight="bold"
                      >
                        {post.user.firstname + " " + post.user.lastname}
                      </Link>
                      <Typography variant="body2" color="text.secondary">
                        {post.user.description}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Post Content */}
                  <Link
                    href={`/post?id=${post._id}`}
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
                      <Tooltip title={`${post.likedCount} likes`} arrow>
                        <IconButton
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <FavoriteIcon color="error" />
                          <Typography sx={{ fontSize: "1rem", mt: 0.1 }}>
                            {" " + post.likedCount}
                          </Typography>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`${post.commentCount} comments`} arrow>
                        <IconButton
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ChatIcon color="primary" />{" "}
                          <Typography sx={{ fontSize: "1rem", mt: 0.1 }}>
                            {" " + post.likedCount}
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {post.tags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          component="a"
                          href={`/tag?name=${tag}`}
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
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag.name}
                  component="a"
                  href={`/tag?name=${tag.name}`}
                  clickable
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
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
              {whoToFollow.map((user, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar
                    src={
                      user.profilePictureId &&
                      `http://localhost:5000/image/${user.profilePictureId}`
                    }
                  >
                    {user.firstname.charAt(0)}
                  </Avatar>
                  <Box>
                    <Link
                      href={`/user?username=${user.username}`}
                      underline="hover"
                      color="text.primary"
                      variant="subtitle1"
                      fontWeight="bold"
                    >
                      {user.firstname + " " + user.lastname}
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      {user.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Layout1>
  );
}
