import { ReactNode } from "react";
import { Box } from "@mui/material";
import login_background from "/login_background.jpg";

export default function Layout2({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          backgroundImage: `url(${login_background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100%",
          filter: "blur(5px)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: -1, // Send the background behind the content
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1, // Bring the content to the front
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "white",
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "5px",
            p: 8,
            minWidth: "21rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
