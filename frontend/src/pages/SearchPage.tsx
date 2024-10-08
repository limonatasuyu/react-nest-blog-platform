import { useEffect, useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Box, Button, Typography, Avatar, Pagination } from "@mui/material";
import PostCard from "../components/PostCard";
import { PostData, userInfo } from "../interfaces";
import CustomLink from "../components/CustomLink";
import SearchOffIcon from "@mui/icons-material/SearchOff";

function createCacheKey(params: {
  [key: string]: string | number | boolean | null;
}) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

function getHashParam(paramName: string) {
  const currentUrl = document.location.toString();
  const hashFragment = currentUrl.split('#')[1];
  if (hashFragment) {
    const paramsString = hashFragment.split('?')[1];
    if (paramsString) {
      const params = new URLSearchParams(paramsString);
      return params.get(paramName);
    }
  }
  return null;
}

export default function SearchPage() {
  const keyword = getHashParam("keyword");

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"Posts" | "Users">("Posts");
  const [cache, setCache] = useState<{ [key: string]: any }>({});

  const cacheKey = createCacheKey({ page, keyword });
  useEffect(() => {
    if (cache[cacheKey]) return;
    fetch(`${"https://react-nest-blog-platform-production.up.railway.app/"}search?${cacheKey}`).then((res) => {
      if (!res.ok) return;
      res.json().then((result) => {
        setCache({ ...cache, [cacheKey]: result });
      });
    });
  }, [cache, keyword, page]);

  return (
    <AppLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          gap: 4,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Box sx={{ maxWidth: "900px", width: "100%" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Search Results For: {keyword}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              mt: 2,
              overflowX: "auto",
              borderBottom: "1px solid #e0e0e0",
              pb: 1,
            }}
          >
            <Button
              variant={activeTab === "Posts" ? "contained" : "outlined"}
              color="primary"
              onClick={() => {
                setActiveTab("Posts");
                setPage(1);
              }}
            >
              Posts
            </Button>
            <Button
              variant={activeTab === "Users" ? "contained" : "outlined"}
              color="primary"
              onClick={() => {
                setActiveTab("Users");
                setPage(1);
              }}
            >
              Users
            </Button>
          </Box>

          {activeTab === "Posts" ? (
            cache[cacheKey]?.postsData?.posts?.length > 0 ? (
              cache[cacheKey]?.postsData?.posts?.map(
                (post: PostData, index: number) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <PostCard post={post} />
                  </Box>
                )
              )
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 4,
                }}
              >
                <SearchOffIcon sx={{ fontSize: 60, color: "gray" }} />
                <Typography
                  variant="h6"
                  sx={{ mt: 2, color: "text.secondary" }}
                >
                  No posts found
                </Typography>
              </Box>
            )
          ) : cache[cacheKey]?.usersData?.users?.length > 0 ? (
            cache[cacheKey]?.usersData?.users?.map(
              (user: userInfo, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Avatar
                    src={
                      user.profilePictureId &&
                      `${"https://react-nest-blog-platform-production.up.railway.app/"}image/${user.profilePictureId}`
                    }
                    sx={{ width: 56, height: 56 }}
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
              )
            )
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 4,
              }}
            >
              <SearchOffIcon sx={{ fontSize: 60, color: "gray" }} />
              <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
                No users found
              </Typography>
            </Box>
          )}

          {((activeTab === "Posts" &&
            cache[cacheKey]?.postData?.totalPageCount > 1) ||
            cache[cacheKey]?.userData?.totalPageCount > 1) && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={
                  activeTab === "Posts"
                    ? cache[cacheKey]?.postData?.totalPageCount
                    : cache[cacheKey]?.userData?.totalPageCount
                }
                shape="rounded"
                sx={{ alignSelf: "center" }}
                showLastButton
                showFirstButton
                page={page}
                //@ts-expect-error i only need the second argument
                onChange={(e: ChangeEvent<unknown>, v: number) => setPage(v)}
              />
            </Box>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
