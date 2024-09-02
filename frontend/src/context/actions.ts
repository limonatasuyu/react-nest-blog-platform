import { CommentData, PostData, RecommendedData } from "../interfaces";

export function fetchPostsRequest() {
  return { type: "FETCH_POSTS_REQUEST" };
}

export function fetchPostsSuccess({
  posts,
  totalPageCount,
  key,
}: {
  posts: PostData[];
  totalPageCount: number;
  key: string;
}) {
  return {
    type: "FETCH_POSTS_SUCCESS",
    payload: { posts, totalPageCount, key },
  };
}

export function fetchPostsFailure(error: string) {
  return {
    type: "FETCH_POSTS_FAILURE",
    payload: error,
  };
}

export function fetchRecommendedRequest() {
  return { type: "FETCH_RECOMMENDED_REQUEST" };
}

export function fetchRecommendedSuccess({
  recommended,
}: {
  recommended: RecommendedData;
}) {
  return {
    type: "FETCH_RECOMMENDED_SUCCESS",
    payload: { ...recommended, key: "recommended" },
  };
}

export function fetchRecommendedFailure(error: string) {
  return { type: "FETCH_RECOMMENDED_FAILURE", payload: error };
}

export function fetchCommentRequest() {
  return { type: "FETCH_COMMENT_REQUEST" }
}

export function fetchCommentSuccess({ comments, key }: { comments: CommentData[], key: string }) {
  return { type: "FETCH_COMMENT_SUCCESS", payload: { comments, key } }
}

export function fetchCommentFailure(error: string) {
  return { type: "FETCH_COMMENT_FAILURE", payload: error }
}
