import Layout1 from "../Layout1";
import { Box, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Layout1>
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
    </Layout1>
  );
}
