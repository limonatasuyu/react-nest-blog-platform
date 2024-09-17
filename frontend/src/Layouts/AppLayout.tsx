import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import Logout from "@mui/icons-material/Logout";
import logo_black from "/logo_black.png";
import CircleIcon from "@mui/icons-material/Circle";
import placeHolderThumbnail from "/placeholderThumbnail.jpg";
import CustomLink from "../components/CustomLink";
import { useRoute } from "../context/RouteProvider";
import GroupsIcon from "@mui/icons-material/Groups";
import { NotificationData } from "../interfaces";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [menuType, setMenuType] = useState<"notification" | "profile" | null>(
    null
  );
  const [isNewNotificationExists, setIsNewNotificationExists] = useState(false);

  const [AnchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(AnchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const { navigate } = useRoute();

  async function handleSeeNotification(notificationIds: string[]) {
    console.log("i got a cal");
    const token = window.sessionStorage.getItem("access_token");
    await fetch(`${"https://react-nest-blog-platform-production.up.railway.app"}notification/see`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ notificationIds }),
    });
  }

  function handleLookAtNotifications() {
    if (!isNewNotificationExists) return;
    const token = window.sessionStorage.getItem("access_token");
    fetch(`${"https://react-nest-blog-platform-production.up.railway.app"}notification/look`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        notificationIds: notifications.map((i) => i.notificationIds).flat(),
      }),
    });
  }

  function handleLogout() {
    window.sessionStorage.removeItem("access_token");
    window.location.pathname = "/login";
  }

  function handleSearch() {
    if (searchValue.length > 3) navigate(`/search?keyword=${searchValue}`);
  }

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`${"https://react-nest-blog-platform-production.up.railway.app"}notification`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) {
        res.json().then((result) => {
          setNotifications(result);
          setIsNewNotificationExists(
            result.find((i: { isSeen: boolean }) => !i.isSeen)
          );
        });
      }
    });
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, backgroundColor: "#ffffff", boxShadow: 1 }}
      >
        <CustomLink to="/" sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo_black}
            height="50"
            alt="Logo"
            style={{ padding: "10px" }}
          />
        </CustomLink>

        <FormControl variant="outlined" sx={{ flex: 1, maxWidth: "500px" }}>
          <InputLabel htmlFor="search">Search</InputLabel>
          <OutlinedInput
            id="search"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
            label="Search"
            sx={{ borderRadius: "20px" }}
          />
        </FormControl>
        <Box display="flex" alignItems="center" sx={{ ml: 2 }}>
          <Tooltip title="Write" arrow>
            <CustomLink to="/create_post">
              <IconButton sx={{ margin: 1 }}>
                <HistoryEduIcon />
              </IconButton>
            </CustomLink>
          </Tooltip>
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={(e) => {
                handleMenuClick(e);
                setMenuType("notification");
                setIsNewNotificationExists(false);
                handleLookAtNotifications();
              }}
              sx={{ margin: 1 }}
            >
              <>
                <NotificationsNoneIcon />
                {isNewNotificationExists && (
                  <CircleIcon
                    color="error"
                    sx={{
                      fontSize: ".7rem",
                      position: "absolute",
                      right: 8,
                      top: 8,
                    }}
                  />
                )}
              </>
            </IconButton>
          </Tooltip>
          <Tooltip title="Account" arrow>
            <IconButton
              onClick={(e) => {
                handleMenuClick(e);
                setMenuType("profile");
              }}
              sx={{ margin: 1 }}
            >
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu anchorEl={AnchorEl} open={menuOpen} onClose={handleMenuClose}>
          {menuType === "profile" ? (
            <div>
              <CustomLink
                to="/profile"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </MenuItem>
              </CustomLink>
              <CustomLink
                to="/my_posts"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DynamicFeedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="My Posts" />
                </MenuItem>
              </CustomLink>

              <CustomLink
                to="/followers"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <GroupsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Followers" />
                </MenuItem>
              </CustomLink>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </div>
          ) : (
            <div style={{ padding: 4 }}>
              {notifications.length ? (
                notifications.map((notification, index) => (
                  <MenuItem
                    onClick={() => {
                      handleSeeNotification(
                        notification.id
                          ? [notification.id]
                          : notification.notificationIds
                      );
                      navigate(notification.targetHref);
                    }}
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px",
                      gap: 2,
                      position: "relative",
                      backgroundColor: notification.isSeen ? "#fff" : "#f5f5f5",
                      "&:hover": {
                        backgroundColor: "#e0e0e0",
                      },
                      borderRadius: 1,
                      mt: 1,
                      boxShadow: notification.isLookedAt
                        ? "none"
                        : "0px 2px 4px rgba(0,0,0,0.1)",
                      width: 400,
                    }}
                  >
                    <Avatar
                      src={
                        notification.lastPerson.profilePictureId &&
                        `${"https://react-nest-blog-platform-production.up.railway.app"}image/${notification.lastPerson.profilePictureId}`
                      }
                      sx={{ width: 48, height: 48 }}
                    >
                      {notification.lastPerson.firstname.charAt(0)}
                    </Avatar>

                    <Box sx={{ flex: 1, ml: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        {notification.lastPerson.firstname}{" "}
                        {notification.lastPerson.lastname}{" "}
                        {notification.count > 1 &&
                          `and ${notification.count - 1} others`}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {notification.type === "like" &&
                          `liked your ${
                            notification.commentId ? "comment" : "post"
                          }`}
                        {notification.type === "comment" &&
                          `commented on your post:`}
                        {notification.type === "answer" &&
                          `answered your comment:`}
                        {notification.type === "follow" && `followed you`}
                      </Typography>
                      {notification.type !== "follow" &&
                        notification.commentContent && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              mt: 0.5,
                              fontStyle: "italic",
                            }}
                          >
                            {notification.commentContent}
                          </Typography>
                        )}

                      <Typography
                        variant="subtitle1"
                        sx={{ color: "text.secondary", fontSize: 10 }}
                      >
                        {notification.passedTime}
                      </Typography>
                    </Box>

                    {notification.thumbnailId && (
                      <Box
                        component="img"
                        src={
                          notification.thumbnailId
                            ? `${"https://react-nest-blog-platform-production.up.railway.app"}image/${notification.thumbnailId}`
                            : placeHolderThumbnail
                        }
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          objectFit: "cover",
                          ml: 2,
                        }}
                      />
                    )}

                    {!notification.isSeen && (
                      <CircleIcon
                        color="error"
                        sx={{
                          fontSize: ".7rem",
                        }}
                      />
                    )}
                  </MenuItem>
                ))
              ) : (
                <Typography
                  sx={{
                    width: 400,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "gray",
                    fontSize: 20,
                  }}
                >
                  No new notifications.
                </Typography>
              )}
            </div>
          )}
        </Menu>
      </Box>

      <Divider />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 2,
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
