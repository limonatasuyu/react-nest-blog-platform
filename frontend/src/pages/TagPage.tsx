import { useState, useEffect } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Box, Link, Typography, Pagination } from "@mui/material";
import useSnackbar from "../hooks/useSnackbar";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { SentimentDissatisfied } from "@mui/icons-material";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import { PostData } from "../interfaces";

export default function MyPostsPage() {
  const params = new URL(document.location.toString()).searchParams;
  const tagName = params.get("name");

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const { setSnackBar } = useSnackbar();

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts?tag=${tagName}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(jsonResponse.message ?? "Something went wrong, please try again later", "error");
          return;
        }
        setPosts(jsonResponse.paginatedResults);
        setTotalPageCount(jsonResponse.totalPageCount);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Something went wrong, please try again later", "error");
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <Loading />;

  return (
    <AppLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          mt: 8,
          px: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ textTransform: "capitalize" }}>
          {tagName} Posts
        </Typography>
        {posts.length ? (
          posts.map((post, index) => <PostCard post={post} key={index} />)
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
              py: 2,
            }}
          >
            <SentimentDissatisfied sx={{ fontSize: "inherit" }} />
            <Typography sx={{ fontSize: "inheriinheritt" }}>No articles found.</Typography>
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
          <Link href={`/create_post?tag=${tagName}`} sx={{ textDecoration: "none", color: "inherit" }}>
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
        {totalPageCount > 1 && (
          <Pagination
            count={totalPageCount}
            sx={{ alignSelf: "center" }}
            showLastButton
            showFirstButton
            shape="rounded"
            //@ts-expect-error i only need the second argument
            onChange={(e, v) => setPage(v)}
          />
        )}
      </Box>
    </AppLayout>
  );
}
