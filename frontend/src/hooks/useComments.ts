import { Dispatch, useEffect } from "react";
import { useStateContext } from "../context/StateProvider";
import { fetchCommentSuccess, fetchCommentRequest, fetchCommentFailure } from "../context/actions";
import { PostsState } from "../context/types";

function createCacheKey(params: { [key: string]: string | number | boolean | null}) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

export default function usePosts(params: { page: number; postId: string | null }) {
  const [{ cache, loading, error }, dispatch] = useStateContext() as [PostsState, Dispatch<any>];

  const cacheKey = createCacheKey(params);

  useEffect(() => {
    if (cache[cacheKey] || params.postId === null) return;

    async function fetchPosts() {
      const token = window.sessionStorage.getItem("access_token");
      dispatch(fetchCommentRequest());
      try {
        const response = await fetch(`http://localhost:5000/comments?${cacheKey}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          dispatch(fetchCommentFailure(data.message ?? "An unexpected error occured, please try again later."));
        } else {
          const { comments } = data;
          dispatch(fetchCommentSuccess({ comments, key: cacheKey }));
        }
      } catch (error) {
        dispatch(
          fetchCommentFailure(
            (error as { message?: string }).message ?? "An unexpected error occured, please try again later."
          )
        );
      }
    }

    fetchPosts();
  }, [dispatch, cacheKey, params.page /*params.postId*/]);

  return { postsData: cache[cacheKey] || { comments: [] }, loading, error };
}
