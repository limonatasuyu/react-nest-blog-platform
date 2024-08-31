import { useState, useEffect, ChangeEvent } from "react";
import { Box, Typography, Divider, Button, Link, Chip, Avatar, Paper, Pagination } from "@mui/material";
import AppLayout from "../Layouts/AppLayout";
import PostCard from "../components/PostCard";
import usePosts from "../hooks/usePosts";

export default function HomePage() {
  const [activeTagTab, setActiveTagTab] = useState("All");
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<{ name: string }[]>([]);
  const [whoToFollow, setWhoToFollow] = useState<
    {
      username: string;
      firstname: string;
      lastname: string;
      description?: string;
      profilePictureId?: string;
    }[]
  >([]);
  //const { setSnackBar } = useSnackbar();
  const { postsData, loading, error } = usePosts({ page });

  useEffect(() => {
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
  }, [page, activeTagTab]);

  if (loading) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          gap: 8,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Box sx={{ flex: 1, maxWidth: "800px" }}>
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {postsData.posts
              .filter((i) => {
                if (activeTagTab === "All") return true;
                return i.tags.find((i_) => i_ === activeTagTab);
              })
              .map((post, index) => (
                <PostCard post={post} key={index} />
              ))}
            {postsData.totalPageCount > 1 && (
              <Pagination
                count={postsData.totalPageCount}
                shape="rounded"
                sx={{ alignSelf: "center" }}
                showLastButton
                showFirstButton
                //@ts-expect-error i only need the second argument
                onChange={(e: ChangeEvent<unknown>, v: number) => setPage(v)}
              />
            )}
          </Box>
        </Box>

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
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff" }}>
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

          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff" }}>
            <Typography variant="h6" gutterBottom>
              Who to Follow
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {whoToFollow.map((user, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={user.profilePictureId && `http://localhost:5000/image/${user.profilePictureId}`}
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
    </AppLayout>
  );
}
