import { useState, ChangeEvent, memo } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Avatar,
  Paper,
  Pagination,
} from "@mui/material";
import AppLayout from "../Layouts/AppLayout";
import PostCard from "../components/PostCard";
import usePosts from "../hooks/usePosts";
import CustomLink from "../components/CustomLink";
import useRecommended from "../hooks/useRecommended";

const HomePage = memo(() => {
  const [activeTagTab, setActiveTagTab] = useState("All");
  const [page, setPage] = useState(1);
  const { postsData, loading/*, error*/ } = usePosts({ page, tag: activeTagTab });
  const { recommended } = useRecommended()
  const { tags, users: whoToFollow } = recommended

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
              onClick={() => {
                setActiveTagTab("All");
                setPage(1);
              }}
            >
              All
            </Button>
            {tags.map((tag, index) => (
              <Button
                key={index}
                variant={activeTagTab === tag.name ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  setActiveTagTab(tag.name);
                  setPage(1);
                }}
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
                page={page}
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
          <Paper
            elevation={3}
            sx={{ padding: 3, borderRadius: 2, backgroundColor: "#fff" }}
          >
            <Typography variant="h6" gutterBottom>
              Recommended Topics
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag, index) => (
                <CustomLink key={index} to={`/tag?name=${tag.name}`}>
                  <Chip
                    label={tag.name}
                    clickable
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                </CustomLink>
              ))}
            </Box>
          </Paper>

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
                      `${"https://react-nest-blog-platform-production.up.railway.app"}image/${user.profilePictureId}`
                    }
                  >
                    {user.firstname.charAt(0)}
                  </Avatar>
                  <Box>
                    <CustomLink
                      to={`/user?username=${user.username}`}
                      underline="hover"
                      color="text.primary"
                      variant="subtitle1"
                      fontWeight="bold"
                    >
                      {user.firstname + " " + user.lastname}
                    </CustomLink>
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
});

export default HomePage;
