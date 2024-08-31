import { PostsAction, PostsState } from "./types";

export const initialPostsState: PostsState = {
  cache: {},
  loading: false,
  error: null,
};

export function reducer(state: PostsState, action: PostsAction): PostsState {
  switch (action.type) {
    case "FETCH_POSTS_REQUEST":
      return { ...state, loading: true };
    case "FETCH_POSTS_SUCCESS":
      return {
        ...state,
        loading: false,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload,
        } as { [key: string]: any },
      };
    case "FETCH_POSTS_FAILURE":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
