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
} from "@mui/material";
import logo_black from "/logo_black.png";
import SearchIcon from "@mui/icons-material/Search";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Layout1({ children }: { children: ReactNode }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <Box display="flex" sx={{ flexDirection: "column" }}>
      <Box
        display="flex"
        sx={{ justifyContent: "space-between", alignItems: "center", mx: 4 }}
      >
        <Box display="flex" sx={{ gap: 2, alignItems: "center", mt: 1 }}>
          <img src={logo_black} height="50rem" style={{ padding: "10px" }} />
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
            <IconButton>
              <HistoryEduIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications" arrow>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account" arrow>
            <IconButton>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      {children}
    </Box>
  );
}
