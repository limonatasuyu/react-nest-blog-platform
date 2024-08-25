import { ChangeEvent, ReactNode, useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import Logout from "@mui/icons-material/Logout";
import logo_black from "/logo_black.png";

export default function Layout1({ children }: { children: ReactNode }) {
  const [searchValue, setSearchValue] = useState("");
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const accountMenuOpen = Boolean(accountAnchorEl);
  const handleAccountMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  function handleLogout() {
    window.sessionStorage.removeItem("access_token");
    window.location.pathname = "/login";
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", maxWidth: "100vw", overflow: "hidden" }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, backgroundColor: "#ffffff", boxShadow: 1 }}
      >
        <Link href="/" sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo_black} height="50" alt="Logo" style={{ padding: "10px" }} />
        </Link>

        <FormControl variant="outlined" sx={{ flex: 1, maxWidth: "500px" }}>
          <InputLabel htmlFor="search">Search</InputLabel>
          <OutlinedInput
            id="search"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
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
            <IconButton sx={{ margin: 1 }}>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Account" arrow>
            <IconButton onClick={handleAccountMenuClick} sx={{ margin: 1 }}>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={accountAnchorEl}
          open={accountMenuOpen}
          onClose={handleAccountMenuClose}
        >
          <MenuItem
            onClick={handleAccountMenuClose}
            component="a"
            href="/profile"
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem
            onClick={handleAccountMenuClose}
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

