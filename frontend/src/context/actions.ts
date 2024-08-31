import { PostData } from "../interfaces";

export function fetchPostsRequest() {
  return { type: "FETCH_POSTS_REQUEST" }
}

export function fetchPostsSuccess({ posts, totalPageCount, key }: {
  posts: PostData[],
  totalPageCount: number,
  key: string,
}) {
  return {
    type: "FETCH_POSTS_SUCCESS",
    payload: { posts, totalPageCount, key },
  }
}

export function fetchPostsFailure(error: string) {
  return {
    type: "FETCH_POSTS_FAILURE",
    payload: error
  }
}
/*
export async function fetchPosts(dispatch: any) {
  dispatch(fetchPostsRequest());
  try {
    const response = await fetch("http://localhost:5000/posts")
    const data = await response.json()
    if (!response.ok) {
      dispatch(fetchPostsFailure(data.message ?? "An unexpected error occured, please try again later."))
    } else {
      dispatch(fetchPostsSuccess(data))
    }
  } catch (error) {
    dispatch(fetchPostsFailure((error as { message?: string; }).message ?? "An unexpected error occured, please try again later."))
  }
}
*/
