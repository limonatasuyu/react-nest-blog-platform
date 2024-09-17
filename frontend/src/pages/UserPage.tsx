import { useEffect, useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import Loading from "../components/Loading";
import { Box, Avatar, Typography, Pagination, Grid, Button } from "@mui/material";
import useSnackbar from "../hooks/useSnackbar";
import { SentimentDissatisfied } from "@mui/icons-material";
import PostCard from "../components/PostCard";
import usePosts from "../hooks/usePosts";
import { useRoute } from "../context/RouteProvider";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const { setSnackBar } = useSnackbar();
  const [page, setPage] = useState(1);
  console.log("userName ith big N", userName)
  const { postsData, loading/*, error*/ } = usePosts({ page, username: userName });
  const { navigate } = useRoute();


  useEffect(() => {
    if (userName === currentUserName) {
      navigate("/my_posts");
      return;
    }
    if (!userName) return;
    const token = window.sessionStorage.getItem("access_token");
    fetch(`${https://react-nest-blog-platform-production.up.railway.app:5000/}user/profile/${userName}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(jsonResponse.message ?? "Unexpected error occured, please try again later", "error");
          return;
        }
        setUserInfo(jsonResponse);
        setIsFollowing(jsonResponse.isUserFollowing)
        setIsInfoSet(true);
      })
      .catch((err) => {
        setSnackBar(err.message ?? "Unexpected error occured, please try again later", "error");
      });
  }, [userName, currentUserName]);

  function handleFollow() {
    const oldIsFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    const token = window.sessionStorage.getItem("access_token")
    fetch(`${https://react-nest-blog-platform-production.up.railway.app:5000/}user/follow/${userName}`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
      if (!res.ok) {
        res.json().then((result) => setSnackBar(result.mesage ?? "An unexpected error occured, please try again later.", "error"))
        setIsFollowing(oldIsFollowing);
      }
    }).catch((err) => {
      setSnackBar(err.mesage ?? "An unexpected error occured, please try again later.", "error")
      setIsFollowing(oldIsFollowing);
    })
  }

  if (!isInfoSet || loading) return <Loading />;

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
              src={userInfo?.profilePictureId && `${https://react-nest-blog-platform-production.up.railway.app:5000/}image/${userInfo?.profilePictureId}`}
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
            <Button variant="contained" sx={{ mt: 1, background: isFollowing ? "gray" : "" }} onClick={handleFollow} >{isFollowing ? "Unfollow" : "Follow"}</Button>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: "1 1 600px", mt: 4 }}>
          <Grid container spacing={4} sx={{ rowGap: 4 }}>
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
            {postsData.totalPageCount > 1 && (
              <Pagination
                count={postsData.totalPageCount}
                showLastButton
                showFirstButton
                shape="rounded"
                page={page}
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
