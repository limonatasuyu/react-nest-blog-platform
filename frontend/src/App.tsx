import { useMemo, useState, useCallback, useEffect } from "react";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SnackbarProvider } from "./hooks/useSnackbar";
import RoutesProvider, { useRoute } from "./context/RouteProvider";
import FollowersPage from "./pages/FollowersPage";
import SearchPage from "./pages/SearchPage";
import { userInfo } from "./interfaces";
//import { Snackbar } from "@mui/material";

function App() {
  const { currentPath, navigate } = useRoute();
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);

  const checkAccessToken = useCallback(async () => {
    const isAuthRoute = [
      "/login",
      "/signup",
      "/forget_password",
      "/activate",
    ].includes(currentPath.split("?")[0]);

    const token = window.sessionStorage.getItem("access_token");

    if (!token) {
      if (!isAuthRoute) {
        navigate("/login");
      }
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (!isAuthRoute) {
          navigate("/login");
        }
        return;
      }

      const jsonResponse = await response.json();
      setUserInfo(jsonResponse);

      if (isAuthRoute) {
        navigate("/");
      }
    } catch (error) {
      if (!isAuthRoute) {
        navigate("/login");
      }
    }
  }, [currentPath, navigate]);

  useEffect(() => {
    checkAccessToken();
  }, [checkAccessToken]);

  const renderPage = useMemo(() => {
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
      "/followers": FollowersPage,
      "/search": SearchPage,
    };

    const PageComponent = routes[currentPath.split("?")[0]] || NotFoundPage;

    const props: { currentUserName?: string; userInfo?: userInfo } = {};
    if (
      ["/profile", "/user", "/my_posts"].includes(currentPath.split("?")[0])
    ) {
      props.currentUserName = userInfo?.username;
    } else if (currentPath.split("?")[0] === "/post" && userInfo) {
      props.userInfo = userInfo
    }

    return <PageComponent {...props} />;
  }, [currentPath, userInfo]);

  return <>{renderPage}</>;
}

export default function Root() {
  return (
    <StateProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
          <RoutesProvider>
            <App />
          </RoutesProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </StateProvider>
  );
}
