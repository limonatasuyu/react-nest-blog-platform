import AppLayout from "../Layouts/AppLayout";
import { Box, Typography } from "@mui/material";

export default function Loading() {
  return (
    <AppLayout>
      <Box
        display="flex"
        sx={{
          width: "100%",
          height: "80vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3">Loading..</Typography>
      </Box>
    </AppLayout>
  );
}
