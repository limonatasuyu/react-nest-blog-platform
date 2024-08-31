import { PostData } from "../interfaces";

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

export type PostsAction = FetchPostsRequestAction | FetchPostsSuccessAction | FetchPostsFailureAction;
