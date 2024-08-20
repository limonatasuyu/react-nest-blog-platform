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
import logo_black from "/logo_black.png";
import SearchIcon from "@mui/icons-material/Search";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import Logout from "@mui/icons-material/Logout";

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
    window.sessionStorage.removeItem("access_token")
    window.location.pathname = "/login"
  }

  return (
    <Box display="flex" sx={{ flexDirection: "column" }}>
      <Box
        display="flex"
        sx={{ justifyContent: "space-between", alignItems: "center", mx: 4 }}
      >
        <Box display="flex" sx={{ gap: 2, alignItems: "center", mt: 1 }}>
          <Link href="/"><img src={logo_black} height="50rem" style={{ padding: "10px" }} /></Link>
          <FormControl variant="outlined">
            <InputLabel htmlFor="search">Search</InputLabel>
            <OutlinedInput
              sx={{ borderRadius: "10px" }}
              inputProps={{
                id: "search",
                value: searchValue,
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  setSearchValue(e.target.value);
                },
              }}
              type="text"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton aria-label="search" edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Search"
            />
          </FormControl>
        </Box>
        <Box display="flex">
          <Tooltip title="Write" arrow>
            <IconButton href="/create_post">
              <HistoryEduIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications" arrow>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Account" arrow>
            <IconButton onClick={handleAccountMenuClick}>
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
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleAccountMenuClose}
            component="a"
            href="/my_posts"
          >
            <ListItemIcon>
              <DynamicFeedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Posts</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <Divider />
      {children}
    </Box>
  );
}
