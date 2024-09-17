import {
  Paper,
  Box,
  Avatar,
  Typography,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import placeHolderThumbnail from "/placeholderThumbnail.jpg";
import { PostData } from "../interfaces";
import CustomLink from "./CustomLink";

export default function PostCard({ post }: { post: PostData }) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
        width: "100%",
      }}
    >
      {/* Post Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Avatar sx={{ mr: 2 }} src={post.user.profilePictureId && `${process.env.API_URL}image/${post.user.profilePictureId}`} >
          {post.user.firstname.charAt(0)}
        </Avatar>

        <Box>
          <CustomLink
            to={`/user?username=${post.user.username}`}
            underline="hover"
            color="text.primary"
            variant="subtitle1"
            fontWeight="bold"
          >
            {post.user.firstname + " " + post.user.lastname}
          </CustomLink>
          <Typography variant="body2" color="text.secondary">
            {post.user.description}
          </Typography>
        </Box>
      </Box>
      {/* Post Content */}
      <CustomLink
        to={`/post?id=${post._id}`}
        underline="none"
        color="inherit"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={
            post.thumbnailId
              ? `${process.env.API_URL}image/${post.thumbnailId}`
              : placeHolderThumbnail
          }
          alt={post.title}
          sx={{
            width: { xs: "100%", sm: "200px" },
            height: "auto",
            borderRadius: 2,
            objectFit: "cover",
          }}
        />
        <Box>
          <Typography variant="h6" gutterBottom>
            {post.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2, // Limit to 2 lines of text
            }}
          >
            {post.content}
          </Typography>
        </Box>
      </CustomLink>

      {/* Post Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={`${post.likedCount} likes`} arrow>
            <IconButton
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <FavoriteIcon color="error" />
              <Typography sx={{ fontSize: "1rem", mt: 0.1 }}>
                {" " + post.likedCount}
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title={`${post.commentCount} comments`} arrow>
            <IconButton sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ChatIcon color="primary" />{" "}
              <Typography sx={{ fontSize: "1rem", mt: 0.1 }}>
                {" " + post.likedCount}
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {post.tags.map((tag, idx) => (
            <CustomLink to={`/tag?name=${tag}`} key={idx}>
              <Chip
                label={tag}
                clickable
                variant="outlined"
                color="primary"
                size="small"
              />
            </CustomLink>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export function PostCardMinimal({ post }: { post: PostData }) {
  return (
    <Box
      sx={{
        mb: 4,
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CustomLink
        to={`/post?id=${post._id}`}
        sx={{ textDecoration: "none", color: "inherit" }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={
              post.thumbnailId
                ? `${process.env.API_URL}image/${post.thumbnailId}`
                : placeHolderThumbnail
            }
            sx={{
              width: "100px",
              height: "100px",
              borderRadius: 1,
              mr: 2,
              objectFit: "cover",
            }}
            alt="Post thumbnail"
          />
          <Box>
            <Typography variant="h6">{post.title}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2, // Limit to 2 lines of text
              }}
            >
              {post.content}
            </Typography>
          </Box>
        </Box>
      </CustomLink>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title={`${post.likedCount} likes`} arrow>
            <IconButton disableRipple>
              <FavoriteIcon color="primary" sx={{ mr: 1 }} />
              {post.likedCount}
            </IconButton>
          </Tooltip>
          <Tooltip title={`${post.commentCount} comments`} arrow>
            <IconButton disableRipple>
              <ChatIcon color="primary" sx={{ mr: 1 }} />
              {post.commentCount}
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {post.tags.map((tag, tagIndex) => (
            <CustomLink to={`/tag?name=${tag}`} key={tagIndex}>
              <Chip
                label={tag}
                clickable
                variant="outlined"
                color="primary"
                size="small"
              />
            </CustomLink>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
