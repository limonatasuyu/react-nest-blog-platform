export type loginDTO =
  | {
      email: string;
      password: string;
    }
  | {
      username: string;
      password: string;
    };
