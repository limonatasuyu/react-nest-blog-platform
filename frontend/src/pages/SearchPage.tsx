import { useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Box, Button, Typography } from "@mui/material";

export default function SearchPage() {

  const params = new URL(document.location.toString()).searchParams;
  const keyword = params.get("keyword");
  
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"Posts" | "Users">("Posts");

  return (
    <AppLayout>
      <Typography variant="h5" sx={{ fontWeight: "bold" }} >Search Results For: {keyword}</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, overflowX: "auto" }}>
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
    </AppLayout>
  );
}
