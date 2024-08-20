import { useState, useEffect } from "react";
import Layout1 from "../Layout1";
import {
  Box,
  Link,
  Typography,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import useSnackbar from "../hooks/useSnackbar";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { setSnackBar } = useSnackbar();

  console.log(posts)

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

  return (
    <Layout1>
      <Box>
        {/*posts.map((i, x) => (
              <Box key={x} sx={{ maxWidth: "45rem", mt: 2 }}>
                <Link
                  display="flex"
                  color="inherit"
                  href="/user"
                  sx={{
                    textDecoration: "none",
                    cursor: "pointer",
                    ml: 1,
                    gap: 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                </Link>
                <Link
                  display="flex"
                  href="/post"
                  color="inherit"
                  sx={{ textDecoration: "none" }}
                >
                  <img
                    src={i.imageDataUrl}
                    style={{ width: "auto", height: "10rem" }}
                  />
                  <Box>
                    <Typography variant="h2">{i.title}</Typography>
                    <Typography variant="caption">{i.description}</Typography>
                  </Box>
                </Link>
                <Box
                  display="flex"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box display="flex" sx={{ gap: 2 }}>
                    <Tooltip title="123 likes" arrow>
                      <IconButton
                        disableRipple
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FavoriteIcon /> 123
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="123 comments" arrow>
                      <IconButton
                        disableRipple
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ChatIcon /> 123
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box display="flex" sx={{ gap: 1 }}>
                    {i.tags.map((i_, x_) => (
                      <Link
                        color="inherit"
                        variant="body2"
                        sx={{
                          backgroundColor: "gray",
                          color: "white",
                          p: "7px",
                          borderRadius: "20px",
                          textDecoration: "none",
                          "&:hover": { background: "#b2b2b2" },
                        }}
                        href={`/tags/${i_}`}
                        key={x_}
                      >
                        {i_}
                      </Link>
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))*/}
      </Box>
    </Layout1>
  );
}
