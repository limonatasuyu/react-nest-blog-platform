import { Link, LinkProps } from "@mui/material";
import { forwardRef, ReactNode, Ref } from "react";
import { useRoute } from "../context/RouteProvider";

const CustomLink = forwardRef((props: { children: ReactNode; to: string } & LinkProps, ref: Ref<HTMLAnchorElement>) => {
  const { navigate } = useRoute();

  return (
    <Link
      {...props}
      onClick={(e) => {
        e.preventDefault();
        navigate(props.to);
      }}
      ref={ref}
      sx={{ cursor: "pointer", ...props.sx }}
    >
      {props.children}
    </Link>
  );
})

export default CustomLink
