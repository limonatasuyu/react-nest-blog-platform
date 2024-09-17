import { Dispatch, useEffect } from "react";
import { useStateContext } from "../context/StateProvider";
import { fetchRecommendedSuccess, fetchRecommendedFailure, fetchRecommendedRequest } from "../context/actions";
import { RecommendedState } from "../context/types";

const cacheKey = "recommended"
export default function useRecommended() {
  const [{ cache, loading, error }, dispatch] = useStateContext() as [RecommendedState, Dispatch<any>];

  useEffect(() => {
    if (cache[cacheKey]) return;

    async function fetchRecommended() {
      const token = window.sessionStorage.getItem("access_token");
      dispatch(fetchRecommendedRequest());
      try {
        const response = await fetch(`${"https://react-nest-blog-platform-production.up.railway.app:5000/"}${cacheKey}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          dispatch(fetchRecommendedFailure(data.message ?? "An unexpected error occured, please try again later."));
        } else {
          const { tags, users } = data;
          dispatch(fetchRecommendedSuccess({ recommended: { tags, users } }));
        }
      } catch (error) {
        dispatch(
          fetchRecommendedFailure(
            (error as { message?: string }).message ?? "An unexpected error occured, please try again later."
          )
        );
      }
    }

    fetchRecommended();
  }, [dispatch]);

  return { recommended: cache[cacheKey] || { users: [], tags: [] }, loading, error };
}
