import { useEffect, useState, useCallback } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SnackbarProvider } from "./hooks/useSnackbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ActivateUserPage from "./pages/ActivateUserPage";
import NotFoundPage from "./pages/NotFoundPage";
import CreatePostPage from "./pages/CreatePostPage";
import MyPostsPage from "./pages/MyPostsPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import TagPage from "./pages/TagPage";
import UserPage from "./pages/UserPage";
import { StateProvider } from "./context/StateProvider";

const routes: { [key: string]: React.FC<{ currentUserName?: string }> } = {
  "/": HomePage,
  "/login": LoginPage,
  "/activate": ActivateUserPage,
  "/signup": SignUpPage,
  "/create_post": CreatePostPage,
  "/my_posts": MyPostsPage,
  "/profile": ProfilePage,
  "/post": PostPage,
  "/change_password": ChangePasswordPage,
  "/tag": TagPage,
  "/user": UserPage,
};

interface UserInfo {
  username: string;
}

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const checkAccessToken = useCallback(async () => {
    const token = window.sessionStorage.getItem("access_token");
    if (!token) {
      if (
        ["/login", "/signup", "/forget_password", "/activate"].includes(route)
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
        ["/login", "/signup", "/forget_password", "/activate"].includes(route)
      )
        return;
      setRoute("/login");
      return;
    }

    const jsonResponse = await response.json();
    setUserInfo(jsonResponse);

    if (
      ["/login", "/signup", "/forget_password", "/activate"].includes(route)
    ) {
      setRoute("/");
    }
  }, [route]);

  useEffect(() => {
    checkAccessToken();
  }, [checkAccessToken]);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (route !== window.location.pathname) {
      window.history.pushState(null, "", route);
    }
  }, [route]);

  function renderPage() {
    const PageComponent = routes[route] || NotFoundPage;

    const props: { currentUserName?: string } = {};
    if (["/profile", "/user", "/my_posts"].includes(route)) {
      props.currentUserName = userInfo?.username;
    }

    return <PageComponent {...props} />;
  }

  return (
    <StateProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>{renderPage()}</SnackbarProvider>
      </LocalizationProvider>
    </StateProvider>
  );
}

export default App;
