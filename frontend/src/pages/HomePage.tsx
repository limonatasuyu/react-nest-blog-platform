import {
  Box,
  Button,
  Divider,
  Typography,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import Layout from "../Layout1";
import { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";

const mockTags = ["Food", "Sports", "Tech", "Business"];
const mockPosts = [
  {
    title: "Test Title",
    description:
      "Voluptates sed non sint. Voluptas sunt maxime ad fugiat soluta sunt earum. Nesciunt enim atque quo accusamus et optio aspernatur asperiores. Ex odit dicta ipsum et illo. Rerum magnam et est ut qui ut in. Et voluptates rerum minima ad consequatur.…",
    imageDataUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F002%2F206%2F011%2Foriginal%2Farticle-icon-free-vector.jpg&f=1&nofb=1&ipt=fa94e0c45693f154e6c62e053caa929bcffacf0fc5adb30fd73052091a585691&ipo=images",
    tags: ["tag1", "tag2", "tag3"],
    user: "some user",
  },
  {
    title: "Test Title",
    description:
      "Voluptates sed non sint. Voluptas sunt maxime ad fugiat soluta sunt earum. Nesciunt enim atque quo accusamus et optio aspernatur asperiores. Ex odit dicta ipsum et illo. Rerum magnam et est ut qui ut in. Et voluptates rerum minima ad consequatur.…",
    imageDataUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F002%2F206%2F011%2Foriginal%2Farticle-icon-free-vector.jpg&f=1&nofb=1&ipt=fa94e0c45693f154e6c62e053caa929bcffacf0fc5adb30fd73052091a585691&ipo=images",
    tags: ["tag1", "tag2", "tag3"],
    user: "some user",
  },
];

const mockTagsToFollow = [
  "tag1",
  "tag2",
  "tag3",
  "tag4",
  "long tag",
  "tag5",
  "long tag 2",
];

const mockWhoToFollow = [
  {
    name: "someOne somene",
    desciption: "this and that",
  },
  {
    name: "someOne somene",
    desciption: "this and that",
  },
  {
    name: "someOne somene",
    desciption: "this and that",
  },
];

export default function HomePage() {
  const [activaTagTab, setActiveTagTab] = useState(mockTags[0]);

  return (
    <Layout>
      <Box display="flex" sx={{ justifyContent: "center", mt: 10, gap: 2 }}>
        <Box>
          <Box display="flex" sx={{ gap: 2 }}>
            {mockTags.map((i, x) => (
              <Button
                variant="text"
                sx={{ color: activaTagTab === i ? "" : "gray" }}
                onClick={() => setActiveTagTab(i)}
                key={x}
              >
                {i}
              </Button>
            ))}
          </Box>
          <Divider />
          <Box>
            {mockPosts.map((i, x) => (
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
                  <AccountCircleIcon />
                  <Typography>{i.user}</Typography>
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
            ))}
          </Box>
        </Box>
        <Divider orientation="vertical" variant="fullWidth" flexItem />
        <Box>
          <Typography variant="h5">Recommended Topics</Typography>
          <Box
            display="flex"
            sx={{ gap: 1, maxWidth: "15rem", flexWrap: "wrap", mt: 2 }}
          >
            {mockTagsToFollow.map((i, x) => (
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
                href={`/tags/${i}`}
                key={x}
              >
                {i}
              </Link>
            ))}
            <Link
              href="/tags"
              color="inherit"
              sx={{
                mt: 2,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              See more
            </Link>
          </Box>
          <Typography variant="h5" sx={{ mt: 4 }}>
            Who To Follow
          </Typography>
          <Box
            display="flex"
            sx={{ gap: 1, maxWidth: "15rem", flexWrap: "wrap", mt: 2 }}
          >
            {mockWhoToFollow.map((i, x) => (
              <Link
                key={x}
                display="flex"
                color="inherit"
                href="/user"
                sx={{
                  textDecoration: "none",
                  cursor: "pointer",
                  ml: 1,
                  gap: 2,
                  alignItems: "center",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <AccountCircleIcon />
                <Box>
                  <Typography>{i.name}</Typography>
                  <Typography variant="body2">{i.desciption}</Typography>
                </Box>
              </Link>
            ))}
            <Link
              href="/tags"
              color="inherit"
              sx={{
                mt: 2,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              See more
            </Link>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
