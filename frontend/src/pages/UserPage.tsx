import { useEffect, useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import Loading from "../components/Loading";
import { Box, Avatar, Typography, Pagination, Grid } from "@mui/material";
import useSnackbar from "../hooks/useSnackbar";
import { SentimentDissatisfied } from "@mui/icons-material";
import PostCard from "../components/PostCard";
import { PostData } from "../interfaces";

export default function UserPage({ currentUserName }: { currentUserName: string }) {
  const params = new URL(document.location.toString()).searchParams;
  const userName = params.get("username");

  const [isInfoSet, setIsInfoSet] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<{
    firstname: string;
    lastname: string;
    username: string;
    description?: string;
    profilePictureId?: string;
  } | null>(null);
  const { setSnackBar } = useSnackbar();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);

  useEffect(() => {
    if (userName === currentUserName) {
      window.location.href = "/my_posts";
      return;
    }
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/user/profile/${userName}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(jsonResponse.message ?? "Unexpected error occured, please try again later", "error");
          return;
        }
        setUserInfo(jsonResponse);
        setIsInfoSet(true);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Unexpected error occured, please try again later", "error");
      });
  }, [userName, currentUserName]);

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts?page=${page}&username=${userName}`, {
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
      });
  }, [userName, page]);

  if (!isInfoSet) {
    return <Loading />;
  }
  return (
    <AppLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          mt: 4,
          gap: 8,
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            flex: "0 1 300px",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "background.paper",
            position: "sticky",
            top: "16px",
          }}
        >
          {/* Sidebar content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              mb: 4,
            }}
          >
            <Avatar
              src={userInfo?.profilePictureId && `http://localhost:5000/image/${userInfo?.profilePictureId}`}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                boxShadow: 2,
              }}
            >
              <span style={{ fontSize: 60 }}>{userInfo?.firstname.charAt(0).toUpperCase()}</span>
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              {userInfo?.firstname + " " + userInfo?.lastname}
            </Typography>
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              @{userInfo?.username}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {userInfo?.description}
            </Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: "1 1 600px" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5">Posts</Typography>
          </Box>
          <Grid container spacing={4} sx={{ rowGap: 4 }}>
            {posts?.length ? (
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
            {totalPageCount > 1 && (
              <Pagination
                count={totalPageCount}
                showLastButton
                showFirstButton
                shape="rounded"
                //@ts-expect-error i only need the second argument
                onChange={(e, v) => setPage(v)}
              />
            )}
          </Grid>
        </Box>
      </Box>
    </AppLayout>
  );
}
