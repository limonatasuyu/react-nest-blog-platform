import { useEffect, useState, useCallback } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ActivateUserPage from "./pages/ActivateUserPage";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CreatePostPage from "./pages/CreatePostPage";
import MyPostsPage from "./pages/MyPostsPage";
import { SnackbarProvider } from "./hooks/useSnackbar";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  console.log(route)
  const checkAccessToken = useCallback(async () => {
    const token = window.sessionStorage.getItem("access_token");
    if (!token) {
      if (
        route === "/login" ||
        route === "/signup" ||
        route === "/forget_password" ||
        route === "/activate"
      )
        return;
      setRoute("/login");
      return;
    }
    const response = await fetch("http://localhost:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (
        route === "/login" ||
        route === "/signup" ||
        route === "/forget_password" ||
        route === "/activate"
      )
        return;
      setRoute("/login");
      return;
    }
    if (
      route === "/login" ||
      route === "/signup" ||
      route === "/forget_password" ||
      route === "/activate"
    ) {
      setRoute("/");
    }
  }, [route]);

  useEffect(() => {
    checkAccessToken();
    //function onPopState() {
    //  setRoute(window.location.pathname);
    //}

    //window.addEventListener("popstate", onPopState);

    let oldHref = window.location.pathname
    const observer = new MutationObserver((mutations) => {
      if (oldHref !== window.location.pathname) {
          oldHref = window.location.pathname
          setRoute(window.location.pathname)
        }
    })

    observer.observe(document.querySelector("body"), {childList: true, subtree: true})
    return () => {
      observer.disconnect()
      //window.removeEventListener("popstate", onPopState);
    };
  }, [checkAccessToken]);

  useEffect(() => {
    if (route === window.location.pathname) return;
    window.history.pushState(null, "", route);
  }, [route]);

  /*const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href) {
      window.history.pushState(null, "", href);
      setRoute(href);
    }
  };*/

  const components = {
    "/": HomePage,
    "/login": LoginPage,
    "/activate": ActivateUserPage,
    "/signup": SignUpPage,
    "/create_post": CreatePostPage,
    "/my_posts": MyPostsPage,
    "/profile": ProfilePage,
    "/post": PostPage,
  };

  const renderComponent = () => {
    const Component = components[route] || NotFoundPage;
    return <Component />;
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <Box>
            {pages.map((page, index) => (
              <Link
                key={index}
                href={page.path}
                underline="none"
              >
                <ListItemButton onClick={() => setIsDrawerOpen(false)}>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItemButton>
              </Link>
            ))}
          </Box>
        </Drawer>
        <div>{renderComponent()}</div>
        </SnackbarProvider>
      </LocalizationProvider>
    </div>
  );
}

export default App;
