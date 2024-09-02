import { CommentData, PostData, RecommendedData } from "../interfaces";

export interface PostsState {
  cache: {
    [key: string]: {
      posts: PostData[];
      totalPageCount: number;
    };
  };
  loading: boolean;
  error: string | null;
}

export interface RecommendedState {
  cache: {
    recommended: RecommendedData;
    key: "recommended";
  };
  loading: boolean;
  error: string | null;
}

export interface CommentState {
  cache: {
    [key: string]: {
      comments: CommentData[],
    }
  },
  loading: boolean,
  errors: string | null
}

export interface FetchPostsRequestAction {
  type: "FETCH_POSTS_REQUEST";
}

export interface FetchPostsSuccessAction {
  type: "FETCH_POSTS_SUCCESS";
  payload: {
    postsData: {
      posts: PostData[];
      totalPageCount: number;
    }[];
    key: string;
  };
}

export interface FetchPostsFailureAction {
  type: "FETCH_POSTS_FAILURE";
  payload: string;
}

export interface FetchRecommendedRequestAction {
  type: "FETCH_RECOMMENDED_REQUEST";
}

export interface FetchRecommendedSuccessAction {
  type: "FETCH_RECOMMENDED_SUCCESS";
  payload: {
    recommended: RecommendedData;
    key: "recommended";
  };
}

export interface FetchRecommendedFailureAction {
  type: "FETCH_RECOMMENDED_FAILURE";
  payload: string;
}

export interface FetchCommentRequestAction {
  type: "FETCH_COMMENT_REQUEST";
}

export interface FetchCommentSuccessAction {
  type: "FETCH_COMMENT_SUCCESS";
  payload: { commentData: CommentData[]; key: string };
}

export interface FetchCommentFailureAction {
  type: "FETCH_COMMENT_FAILURE";
  payload: string;
}

export type CommentAction =
  | FetchCommentRequestAction
  | FetchCommentSuccessAction
  | FetchCommentFailureAction;

export type RecommendedAction =
  | FetchRecommendedRequestAction
  | FetchRecommendedSuccessAction
  | FetchRecommendedFailureAction;

export type PostsAction =
  | FetchPostsRequestAction
  | FetchPostsSuccessAction
  | FetchPostsFailureAction;
