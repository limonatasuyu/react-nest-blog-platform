import { useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Box, Typography, Pagination } from "@mui/material";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { SentimentDissatisfied } from "@mui/icons-material";
import Loading from "../components/Loading";
import { PostCardMinimal } from "../components/PostCard";
import usePosts from "../hooks/usePosts";
import CustomLink from "../components/CustomLink";

export default function MyPostsPage({ currentUserName }: { currentUserName: string }) {
  
  const [page, setPage] = useState(1);
  const { postsData, loading/*, error*/ } = usePosts({page, username: currentUserName})

  //if (!currentUserName || error) return <ErrorPage />
  if (loading) return <Loading />;

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
        <Typography variant="h4" align="center" gutterBottom>
          Your Posts
        </Typography>
        {postsData.posts.length ? (
          postsData.posts.map((post, index) => <PostCardMinimal post={post} key={index} />)
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
          <CustomLink to="/create_post" sx={{ textDecoration: "none", color: "inherit" }}>
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
          </CustomLink>
        </Box>

        {postsData.totalPageCount > 1 && (
          <Pagination
            count={postsData.totalPageCount}
            sx={{ alignSelf: "center" }}
            showLastButton
            showFirstButton
            shape="rounded"
            page={page}
            //@ts-expect-error i only need the second argument
            onChange={(e, v) => setPage(v)}
          />
        )}
      </Box>
    </AppLayout>
  );
}
