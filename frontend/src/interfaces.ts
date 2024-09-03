export interface userInfo {
  profilePictureId?: string;
  firstname: string;
  lastname: string;
  username: string;
  description?: string;
}

export interface PostData {
  _id: string;
  title: string;
  content: string;
  commentCount: number;
  likedCount: number;
  thumbnailId?: string;
  tags: string[];
  user: userInfo;
  totalPageCount: number;
}

export interface RecommendedData {
  tags: {
    name: string;
  }[];
  users: userInfo[];
}

export interface ReplyData {
  user: userInfo;
  content: string;
  createdAt: string;
  _id: string;
  isUserLiked: boolean;
  likedCount: number;
}

export interface CommentData extends ReplyData {
  answers?: ReplyData[];
}
