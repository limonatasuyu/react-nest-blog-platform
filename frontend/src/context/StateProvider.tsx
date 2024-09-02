import {
  createContext,
  ReactNode,
  useReducer,
  useContext,
  Dispatch,
} from "react";
import { reducer, initialState } from "./reducer";
import {
  PostsAction,
  PostsState,
  RecommendedAction,
  RecommendedState,
} from "./types";

const StateContext = createContext([
  {
    cache: {},
    loading: true,
  },
] as (
  | PostsState
  | RecommendedState
  | Dispatch<PostsAction | RecommendedAction>
)[]);

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={[state, dispatch]}>
      {children}
    </StateContext.Provider>
  );
}

export const useStateContext = () => useContext(StateContext);
