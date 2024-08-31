import { createContext, ReactNode, useReducer, useContext, Dispatch } from "react";
import { reducer, initialPostsState } from "./reducer";
import { PostsAction, PostsState } from "./types";

const StateContext = createContext([{
  cache: {},
  loading: true,
}] as (PostsState | Dispatch<PostsAction>)[]);

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialPostsState);
  return <StateContext.Provider value={[state, dispatch]}>{children}</StateContext.Provider>;
}

export const useStateContext = () => useContext(StateContext);
