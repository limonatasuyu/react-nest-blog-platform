import { Dispatch, useEffect } from "react";
import { useStateContext } from "../context/StateProvider";
import { fetchPostsRequest, fetchPostsSuccess, fetchPostsFailure } from "../context/actions";
import { PostsState } from "../context/types";

function createCacheKey(params: { [key: string]: string | number | boolean }) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

export default function usePosts(params: { page: number; username?: string; tag?: string }) {
  const [{ cache, loading, error }, dispatch] = useStateContext() as [PostsState, Dispatch<any>];

  const cacheKey = createCacheKey(params);

  useEffect(() => {
    if (cache[cacheKey]) return;

    async function fetchPosts() {
      const token = window.sessionStorage.getItem("access_token");
      dispatch(fetchPostsRequest());
      try {
        const response = await fetch(`http://localhost:5000/posts?${cacheKey}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          dispatch(fetchPostsFailure(data.message ?? "An unexpected error occured, please try again later."));
        } else {
          const { posts, totalPageCount } = data;
          dispatch(fetchPostsSuccess({ posts, totalPageCount, key: cacheKey }));
        }
      } catch (error) {
        dispatch(
          fetchPostsFailure(
            (error as { message?: string }).message ?? "An unexpected error occured, please try again later."
          )
        );
      }
    }

    fetchPosts();
  }, [dispatch, cacheKey]);

  return { postsData: cache[cacheKey] || { totalPageCount: 1, posts: [] }, loading, error };
}
