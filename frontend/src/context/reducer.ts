import {
  CommentAction,
  CommentState,
  PostsAction,
  PostsState,
  RecommendedAction,
  RecommendedState,
} from "./types";

export const initialState = {
  cache: {},
  loading: false,
  error: null,
};

export function reducer(
  state: PostsState | RecommendedState | CommentState,
  action: PostsAction | RecommendedAction | CommentAction
): PostsState | RecommendedState | CommentState {
  const requestTypes = [
    "FETCH_POSTS_REQUEST",
    "FETCH_RECOMMENDED_REQUEST",
    "FETCH_COMMENT_REQUEST",
  ];

  const successTypes = [
    "FETCH_POSTS_SUCCESS",
    "FETCH_RECOMMENDED_SUCCESS",
    "FETCH_COMMENT_SUCCESS",
  ];

  const failureTypes = [
    "FETCH_POSTS_FAILURE",
    "FETCH_RECOMMENDED_FAILURE",
    "FETCH_COMMENT_FAILURE",
  ];

  if (requestTypes.includes(action.type)) {
    return { ...state, loading: true };
  }

  if (successTypes.includes(action.type)) {
    return {
      ...state,
      loading: false,
      cache: {
        ...state.cache,
        //@ts-expect-error payload exists in succesTypes
        [action.payload.key]: action.payload,
      } as { [key: string]: any },
    };
  }

  if (failureTypes.includes(action.type)) {
    //@ts-expect-error payload exists in succesTypes
    return { ...state, loading: false, error: action.payload };
  }

  return state;
}
