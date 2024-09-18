import {
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";

const RoutesContext = createContext({
  currentPath: "/",
  //@ts-expect-error path is needed in type
  navigate: (path: string) => {},
});

export default function RoutesProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState(
    window.location.hash.slice(1) || "/"
  );

  useEffect(() => {
    const handleHashChange = () =>
      setCurrentPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const value = useMemo(() => ({ currentPath, navigate }), [currentPath]);

  return (
    <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>
  );
}

export const useRoute = () => useContext(RoutesContext);
