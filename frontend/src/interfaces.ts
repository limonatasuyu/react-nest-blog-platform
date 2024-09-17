export interface userInfo {
  profilePictureId?: string;
  firstname: string;
  lastname: string;
  username: string;
  description?: string;
  email?: string;
}

export interface PostData {
  isUserLiked: boolean;
  createdAt: string | number | Date;
  _id: string;
  title: string;
  content: string;
  commentCount: number;
  likedCount: number;
  thumbnailId?: string;
  tags: string[];
  user: userInfo;
  //totalPageCount: number;
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
  answerPageCount: number;
  answers?: ReplyData[];
}

export interface NotificationData {
  id?: string;
  type: "like" | "comment" | "answer" | "follow";
  commentId: string;
  postId: string;
  lastPerson: {
    firstname: string;
    lastname: string;
    username: string;
    profilePictureId?: string;
  };
  count: number;
  isLookedAt: boolean;
  notificationIds: string[];
  isSeen: boolean;
  targetHref: string;
  commentContent?: string;
  thumbnailId?: string;
  answerContent?: string;
  passedTime: string;
};
