import {
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";

const RoutesContext = createContext({ currentPath: "/" });

export default function RoutesProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const value = useMemo(() => ({ currentPath, navigate }), [currentPath]);

  return (
    <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>
  );
}

export const useRoute = () => useContext(RoutesContext);
