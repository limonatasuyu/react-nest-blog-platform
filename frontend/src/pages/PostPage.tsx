import {
  Box,
  TextField,
  Typography,
  Button,
  Avatar,
  Grid,
  Card,
  AlertColor,
  Tooltip,
  IconButton,
  Modal,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AppLayout from "../Layouts/AppLayout";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import useSnackbar from "../hooks/useSnackbar";
import placeholderThumbnail from "/placeholderThumbnail.jpg";
import { marked } from "marked";
import {
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import NotFoundPage from "./NotFoundPage";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

function calculateReadingTime(text: string) {
  const wordsPerMinute = 225; // You can adjust this value based on your preference

  const wordCount = text.trim().split(/\s+/).length;

  const readingTimeMinutes = wordCount / wordsPerMinute;

  return Math.ceil(readingTimeMinutes);
}

interface userInfo {
  profilePictureId?: string;
  firstname: string;
  lastname: string;
  username: string;
  description?: string;
}

interface commentData {
  user: userInfo;
  content: string;
  createdAt: string;
  _id: string;
  isUserLiked: boolean;
  likedCount: number;
  answers?: ReplyData[];
}

interface ReplyData {
  user: userInfo;
  content: string;
  createdAt: string;
  _id: string;
  isUserLiked: boolean;
  likedCount: number;
}

interface postData {
  title: string;
  thumbnailId?: string;
  content: string;
  comments: commentData[];
  user: userInfo;
  commentCount: number;
  likedCount: number;
  isUserLiked: boolean;
  createdAt: string;
  isUserSaved: boolean;
}

export default function PostPage() {
  const params = new URL(document.location.toString()).searchParams;
  const postId = params.get("id");

  const [post, setPost] = useState<postData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSnackBar } = useSnackbar();
  const [isUserLiked, setIsUserLiked] = useState(false);
  const [modalType, setModalType] = useState<"share" | "report" | null>(null);
  const [isUserSaved, setIsUserSaved] = useState(false);

  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const moreMenuOpen = Boolean(moreAnchorEl);
  const handleMoreMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setMoreAnchorEl(null);
  };

  function handleSave() {
    const oldIsSaved = isUserSaved;
    setIsUserSaved(!oldIsSaved);
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts/save/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          setIsUserSaved(oldIsSaved);
          res
            .json()
            .then((res) =>
              setSnackBar(
                res.message ??
                  "Unexpected error occured, please try again later.",
                "error"
              )
            );
        }
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later.",
          "error"
        );
        setIsUserSaved(oldIsSaved);
      });
  }

  function fetchData() {
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later.",
            "error"
          );
          return;
        }
        setPost(jsonResponse);
        setIsUserLiked(jsonResponse.isUserLiked);
        setIsUserSaved(jsonResponse.isUserSaved);
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later.",
          "error"
        )
      )
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleSubmit() {
    const token = window.sessionStorage.getItem("access_token");
    setIsSubmitting(true);
    fetch(`http://localhost:5000/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({ postId, content: comment }),
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later",
            "error"
          );
          return;
        }
        setSnackBar(
          jsonResponse.message ?? "Comment added successfully.",
          "success"
        );
        fetchData();
        setComment("");
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        )
      )
      .finally(() => setIsSubmitting(false));
  }

  function handleLike() {
    const isLiked = !isUserLiked;
    setIsUserLiked(isLiked);
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts/like/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          setIsUserLiked(!isLiked);
          res
            .json()
            .then((res) =>
              setSnackBar(
                res.message ??
                  "Unexpected error occured, please try again later",
                "error"
              )
            );
        }
      })
      .catch((err) => {
        setIsUserLiked(!isLiked);
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        );
      });
  }

  if (!loaded) return <Loading />;
  if (!post || !postId) return <NotFoundPage />;

  return (
    <AppLayout>
      <Box display="flex" justifyContent="center" mb={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="start"
          sx={{ width: "60%" }}
          gap={3}
          mb={2}
        >
          <Avatar
            sx={{
              height: "4rem",
              width: "4rem",
              bgcolor: "primary.main",
              boxShadow: 4,
            }}
          >
            {post.user?.profilePictureId ? (
              <Box
                component="img"
                src={`http://localhost:5000/image/${post.user?.profilePictureId}`}
                sx={{ borderRadius: "50%", width: "100%", height: "100%" }}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: "2.5rem" }} />
            )}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {post.user?.firstname + " " + post.user?.lastname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.user.description && post.user.description + " · "}published
              at {new Date(post.createdAt).toLocaleString() + " · "}
              {calculateReadingTime(post.content)} min read
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" justifyContent="center" mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ width: "60%" }}
        >
          <Box display="flex" gap={3}>
            <Tooltip title={`${post.commentCount} comments`}>
              <Box display="flex" alignItems="center" gap={1}>
                <ChatIcon />
                <Typography variant="body2">{post.commentCount}</Typography>
              </Box>
            </Tooltip>
            <Tooltip
              title={`${
                post.likedCount +
                (post.isUserLiked
                  ? isUserLiked
                    ? 0
                    : -1
                  : isUserLiked
                    ? 1
                    : 0)
              } likes`}
            >
              <IconButton
                onClick={handleLike}
                color={isUserLiked ? "error" : "primary"}
              >
                <FavoriteIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {post.likedCount +
                    (post.isUserLiked
                      ? isUserLiked
                        ? 0
                        : -1
                      : isUserLiked
                        ? 1
                        : 0)}
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Save">
              <IconButton onClick={handleSave}>
                {isUserSaved ? <TurnedInIcon /> : <TurnedInNotIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton onClick={() => setModalType("share")}>
                <IosShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton onClick={handleMoreMenuClick}>
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={moreAnchorEl}
            open={moreMenuOpen}
            onClose={handleMoreMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMoreMenuClose();
                setModalType("report");
              }}
            >
              <ListItemIcon>
                <ReportGmailerrorredIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Report" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Modal
        open={Boolean(modalType)}
        onClose={() => setModalType(null)}
        aria-labelledby="modal-share-title"
        aria-describedby="modal-share-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 320,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 10,
            p: 2,
            textAlign: "center",
          }}
        >
          {modalType === "share" ? (
            <>
              <Typography
                id="modal-share-title"
                variant="subtitle1"
                component="h2"
                sx={{ mb: 2 }}
              >
                Share This Post
              </Typography>
              {/* Copy to Clipboard */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 1,
                  p: 1,
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#555",
                  }}
                >
                  {`https://yourwebsite.com/content/${modalType}`}
                </Typography>
                <IconButton
                  sx={{ p: 0.5, ml: 1 }}
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `https://yourwebsite.com/content/${modalType}`
                    )
                  }
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Share Buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-evenly", pt: 1 }}
              >
                <IconButton
                  sx={{ color: "#1877F2" }}
                  onClick={() => {
                    /* Handle Facebook share */
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  sx={{ color: "#1DA1F2" }}
                  onClick={() => {
                    /* Handle Twitter share */
                  }}
                >
                  <XIcon />
                </IconButton>
                <IconButton
                  sx={{ color: "#0077B5" }}
                  onClick={() => {
                    /* Handle LinkedIn share */
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <ReportPostForm setSnackBar={setSnackBar} postId={postId} />
          )}
        </Box>
      </Modal>

      <Box sx={{ width: "100%", padding: { xs: 2, md: 5 } }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Typography
              variant="h3"
              sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
            >
              {post?.title}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <img
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  objectFit: "cover",
                }}
                src={
                  post?.thumbnailId
                    ? `http://localhost:5000/image/${post?.thumbnailId}`
                    : placeholderThumbnail
                }
                alt="Post Thumbnail"
              />
            </Box>
            <Box
              sx={{
                mt: 4,
                textAlign: "left",
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{
                __html: marked.parse(post?.content ?? "", {
                  async: false,
                  breaks: true,
                }),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ width: "100%", padding: { xs: 2, md: 5 }, mt: 4 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Comments
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 4,
              }}
            >
              <TextField
                fullWidth
                value={comment}
                onChange={(e) => {
                  if (isSubmitting) return;
                  setComment(e.target.value);
                }}
                placeholder="Write a comment..."
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                disabled={!comment.length || isSubmitting}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>

            {post?.comments.map((i, x) => (
              <CommentCard
                commentData={i}
                postId={postId as string}
                setSnackBar={setSnackBar}
                key={x}
              />
            ))}
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}

function CommentCard({
  commentData,
  setSnackBar,
  postId,
}: {
  commentData: commentData;
  setSnackBar: (message: string, status: AlertColor) => void;
  postId: string;
}) {
  const [isReplyInputVisible, setIsReplyInputVisible] = useState(false);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(commentData.likedCount);
  const [isUserLiked, setIsUserLiked] = useState(commentData.isUserLiked);

  function handleSubmit() {
    const token = window.sessionStorage.getItem("access_token");
    setIsSubmitting(true);
    fetch(`http://localhost:5000/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        answeredCommentId: commentData._id,
        postId,
        content: reply,
      }),
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later",
            "error"
          );
          return;
        }
        setSnackBar(
          jsonResponse.message ?? "Comment added successfully.",
          "success"
        );
        //fetchData();
        setReply("");
      })
      .catch((err) =>
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later",
          "error"
        )
      )
      .finally(() => setIsSubmitting(false));
  }

  function handleLike() {
    const oldIsUserLiked = isUserLiked;
    const oldLikeCount = likeCount;
    let likeChange = 0;

    if (commentData.isUserLiked && oldIsUserLiked) {
      likeChange = -1;
    } else if (commentData.isUserLiked && !oldIsUserLiked) {
      likeChange = 1;
    } else if (!commentData.isUserLiked && !oldIsUserLiked) {
      likeChange = 1;
    } else {
      likeChange = -1;
    }
    const newLikeCount = oldLikeCount + likeChange;
    setIsUserLiked(!oldIsUserLiked);
    setLikeCount(newLikeCount);

    const token = window.sessionStorage.getItem("access_token");

    fetch(`http://localhost:5000/comments/${commentData._id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          setLikeCount(oldLikeCount);
          setIsUserLiked(oldIsUserLiked);
          res
            .json()
            .then((res) =>
              setSnackBar(
                res.message ??
                  "Unexpected error occurred, please try again later",
                "error"
              )
            );
        }
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Unexpected error occurred, please try again later",
          "error"
        );
        setLikeCount(oldLikeCount);
      });
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
      sx={{ width: "100%" }}
    >
      <Card
        sx={{
          mb: 3,
          p: 2,
          boxShadow: 2,
          "&:hover": {
            boxShadow: 4,
          },
          width: "100%",
          borderRadius: "8px",
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar
            sx={{
              height: "3rem",
              width: "3rem",
              bgcolor: "primary.main",
              boxShadow: 3,
            }}
          >
            {commentData.user?.profilePictureId ? (
              <Box
                component="img"
                src={`http://localhost:5000/image/${commentData.user?.profilePictureId}`}
                sx={{ borderRadius: "50%", width: "100%", height: "100%" }}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: "2rem" }} />
            )}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {commentData.user?.firstname + " " + commentData.user?.lastname}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(commentData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "1rem",
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          {commentData.content}
        </Typography>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Button
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => setIsReplyInputVisible(!isReplyInputVisible)}
          >
            <ChatIcon sx={{ mr: 1 }} /> Reply
          </Button>
          <Button
            size="small"
            sx={{ textTransform: "none" }}
            color={isUserLiked ? "error" : "primary"}
            onClick={handleLike}
          >
            <FavoriteIcon sx={{ mr: 1 }} /> Like ({likeCount})
          </Button>
        </Box>
      </Card>
      {commentData.answers?.map((i, x) => (
        <ReplyComment key={x} setSnackBar={setSnackBar} reply={i} />
      ))}
      {isReplyInputVisible && (
        <Card
          sx={{
            mb: 3,
            p: 2,
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
            width: "90%",
            justifySelf: "flex-end",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              value={reply}
              onChange={(e) => {
                if (isSubmitting) return;
                setReply(e.target.value);
              }}
              placeholder="Write a reply..."
            />
            <Button
              variant="contained"
              disabled={!reply.length || isSubmitting}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}

function ReplyComment({
  reply,
  setSnackBar,
}: {
  reply: ReplyData;
  setSnackBar: (msg: string, status: AlertColor) => void;
}) {
  const [likeCount, setLikeCount] = useState(reply.likedCount);
  const [isUserLiked, setIsUserLiked] = useState(reply.isUserLiked);

  function handleLike() {
    const oldIsUserLiked = isUserLiked;
    const oldLikeCount = likeCount;
    let likeChange = 0;

    if (reply.isUserLiked && oldIsUserLiked) {
      likeChange = -1;
    } else if (reply.isUserLiked && !oldIsUserLiked) {
      likeChange = 1;
    } else if (!reply.isUserLiked && !oldIsUserLiked) {
      likeChange = 1;
    } else {
      likeChange = -1;
    }

    const newLikeCount = oldLikeCount + likeChange;
    setIsUserLiked(!oldIsUserLiked);
    setLikeCount(newLikeCount);

    const token = window.sessionStorage.getItem("access_token");

    fetch(`http://localhost:5000/comments/${reply._id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          setLikeCount(oldLikeCount);
          setIsUserLiked(oldIsUserLiked);
          res
            .json()
            .then((res) =>
              setSnackBar(
                res.message ??
                  "Unexpected error occurred, please try again later",
                "error"
              )
            );
        }
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Unexpected error occurred, please try again later",
          "error"
        );
        setLikeCount(oldLikeCount);
      });
  }
  return (
    <Card
      sx={{
        mb: 3,
        p: 2,
        boxShadow: 2,
        "&:hover": {
          boxShadow: 4,
        },
        width: "90%",
        justifySelf: "flex-end",
        borderRadius: "8px",
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Avatar
          sx={{
            height: "3rem",
            width: "3rem",
            bgcolor: "primary.main",
            boxShadow: 3,
          }}
        >
          {reply.user?.profilePictureId ? (
            <Box
              component="img"
              src={`http://localhost:5000/image/${reply.user?.profilePictureId}`}
              sx={{ borderRadius: "50%", width: "100%", height: "100%" }}
            />
          ) : (
            <AccountCircleIcon sx={{ fontSize: "2rem" }} />
          )}
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {reply.user?.firstname + " " + reply.user?.lastname}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(reply.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
      <Typography
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          padding: "1rem",
          lineHeight: 1.6,
          mb: 2,
        }}
      >
        {reply.content}
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button
          size="small"
          sx={{ textTransform: "none" }}
          color={isUserLiked ? "error" : "primary"}
          onClick={handleLike}
        >
          <FavoriteIcon sx={{ mr: 1 }} /> Like ({likeCount})
        </Button>
      </Box>
    </Card>
  );
}

function ReportPostForm({
  postId,
  setSnackBar,
}: {
  postId: string;
  setSnackBar: (msg: string, status: AlertColor) => void;
}) {
  const [values, setValues] = useState<{
    text: string;
    reason: "spam" | "abusive" | "misinformation" | "other" | null;
  }>({
    text: "",
    reason: null,
  });
  const [errors, setErrors] = useState<{ text?: string; reason?: string }>({});

  function handleValidation() {
    const errors: { text?: string; reason?: string } = {};
    if (values.text !== "" && values.text.length < 10) {
      errors.text = "Please make sure that text is longer then 10 characters.";
    }

    if (!values.reason) {
      errors.reason = "Please choose a reason.";
    }
    setErrors(errors);
    return errors;
  }

  function handleSubmit() {
    const errors = handleValidation();
    if (errors.text || errors.reason) return;
    const token = window.sessionStorage.getItem("access_token");
    fetch(`http://localhost:5000/posts/report/${postId}`, {
      method: "POST",
      headers: { Authorization: `Bearer  ${token}` },
    })
      .then(async (res) => {
        const jsonResponse = await res.json();
        if (!res.ok) {
          setSnackBar(
            jsonResponse.message ??
              "Unexpected error occured, please try again later.",
            "error"
          );
          return;
        }
        setSnackBar(
          jsonResponse.message ??
            "Report made successfully, thank you for the feedback",
          "success"
        );
      })
      .catch((err) => {
        setSnackBar(
          err.message ?? "Unexpected error occured, please try again later.",
          "error"
        );
      });
  }
  return (
    <>
      <Typography
        id="modal-report-title"
        variant="subtitle1"
        component="h2"
        sx={{ mb: 2 }}
      >
        Report This Post
      </Typography>

      <Typography
        id="modal-report-description"
        variant="body2"
        sx={{ mb: 2, color: "#555" }}
      >
        Please select a reason for reporting this post:
      </Typography>

      {/* Report Options */}
      <Box sx={{ mb: 2, textAlign: "left" }}>
        <FormControl variant="standard" error={Boolean(errors.reason)}>
          <RadioGroup
            aria-label="report-reason"
            name="report-reason"
            value={values.reason}
            onChange={(e) => {
              setValues({
                ...values,
                reason: e.target.value as
                  | "spam"
                  | "abusive"
                  | "misinformation"
                  | "other"
                  | null,
              });

              handleValidation();
            }}
          >
            <FormControlLabel value="spam" control={<Radio />} label="Spam" />
            <FormControlLabel
              value="abusive"
              control={<Radio />}
              label="Abusive or Harmful"
            />
            <FormControlLabel
              value="misinformation"
              control={<Radio />}
              label="Misinformation"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
          <FormHelperText>{errors.reason}</FormHelperText>
        </FormControl>
      </Box>

      {/* Additional Information */}
      <TextField
        label="Additional Information (optional)"
        multiline
        rows={3}
        variant="outlined"
        fullWidth
        value={values.text}
        onChange={(e) => {
          setValues({ ...values, text: e.target.value });
          handleValidation();
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
          "& .MuiInputLabel-root": {
            fontSize: 14,
            color: "#555",
          },
        }}
        error={Boolean(errors.text)}
        helperText={errors.text}
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        sx={{ bgcolor: "#d32f2f", color: "#fff", width: "100%" }}
        onClick={handleSubmit}
      >
        Submit Report
      </Button>
    </>
  );
}
