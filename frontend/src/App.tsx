import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import {
  Drawer,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

function App() {
  const [route, setRoute] = useState("/");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  async function checkAccessToken() {
    const token = window.sessionStorage.getItem("access_token");
    if (!token) {
      setRoute("/login");
      return;
    }
    const response = await fetch("http://localhost:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) setRoute("/login");
  }

  useEffect(() => {
    checkAccessToken();
    function onPopState() {
      setRoute(window.location.pathname);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const renderComponent = () => {
    switch (route) {
      case "/":
        return <HomePage />;
      case "/login":
        return <LoginPage />;
      default:
        return <NotFoundPage />;
    }
  };

  const pages = [
    {
      name: "Home",
      path: "/",
      icon: <HomeIcon />,
    },
  ];

  return (
    <div>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box>
          {pages.map((page, index) => (
            <Link key={index} href={page.path} underline="none">
              <ListItemButton>
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={page.name} />
              </ListItemButton>
            </Link>
          ))}
        </Box>
      </Drawer>
      <div>{renderComponent()}</div>
    </div>
  );
}

export default App;
