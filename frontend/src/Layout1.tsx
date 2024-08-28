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
  Link,
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

export default function Layout1({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<
    {
      type: "like";
      commentId: string;
      postId: string;
      lastPerson: {
        firstname: string;
        lastname: string;
        username: string;
        profilePictureId?: string;
      };
      count: number;
      isLookedAt: boolean;
    }[]
  >([]);
  const [searchValue, setSearchValue] = useState("");
  const [menuType, setMenuType] = useState<"notification" | "profile" | null>(
    null
  );

  const [AnchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(AnchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  function handleLogout() {
    window.sessionStorage.removeItem("access_token");
    window.location.pathname = "/login";
  }

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    fetch("http://localhost:5000/notification", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) {
        res.json().then((result) => setNotifications(result));
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
        <Link href="/" sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo_black}
            height="50"
            alt="Logo"
            style={{ padding: "10px" }}
          />
        </Link>

        <FormControl variant="outlined" sx={{ flex: 1, maxWidth: "500px" }}>
          <InputLabel htmlFor="search">Search</InputLabel>
          <OutlinedInput
            id="search"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton aria-label="search">
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
            <IconButton href="/create_post" sx={{ margin: 1 }}>
              <HistoryEduIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={(e) => {
                handleMenuClick(e);
                setMenuType("notification");
              }}
              sx={{ margin: 1 }}
            >
              <>
                <NotificationsNoneIcon />
                {notifications.find(i => !i.looked) && <CircleIcon
                  color="error"
                  sx={{ fontSize: ".7rem", position: "absolute", right: 8, top: 8 }}
                />}
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
            <>
              <MenuItem onClick={handleMenuClose} component="a" href="/profile">
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                component="a"
                href="/my_posts"
              >
                <ListItemIcon>
                  <DynamicFeedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Posts" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <MenuItem
                  onClick={handleMenuClose}
                  component="a"
                  href="/my_posts"
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    gap: 2,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  {notification.type === "like" && !notification.commentId && (
                    <Link
                      href={`/post?id=${notification.postId}`}
                      underline="none"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <Avatar
                        src={
                          notification.lastPerson.profilePictureId &&
                          `http://localhost:5000/image/${notification.lastPerson.profilePictureId}`
                        }
                      >
                        {notification.lastPerson.firstname.charAt(0)}
                      </Avatar>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {notification.lastPerson.firstname +
                            " " +
                            notification.lastPerson.lastname}{" "}
                          {notification.count > 1 &&
                            `and ${notification.count - 1} other people`}
                        </Typography>
                        <Typography variant="body2">liked your post</Typography>
                      </Box>
                    </Link>
                  )}
                </MenuItem>
              ))}
            </>
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
