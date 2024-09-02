import { memo, useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Box, Typography, Pagination } from "@mui/material";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { SentimentDissatisfied } from "@mui/icons-material";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import usePosts from "../hooks/usePosts";
import CustomLink from "../components/CustomLink";

const Tagpage = memo(() => {
  const params = new URL(document.location.toString()).searchParams;
  const tagName = params.get("name");

  const [page, setPage] = useState(1);

  const { postsData, loading, error } = usePosts({ page, tag: tagName })

  //if (!tagName || error) return <ErroPage />
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
          gap: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ textTransform: "capitalize" }}>
          {tagName} Posts
        </Typography>
        {postsData.posts.length ? (
          postsData.posts.map((post, index) => <PostCard post={post} key={index} />)
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
            width: "102%",
          }}
        >
          <CustomLink to={`/create_post?tag=${tagName}`} sx={{ textDecoration: "none", color: "inherit" }}>
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
})

export default Tagpage
