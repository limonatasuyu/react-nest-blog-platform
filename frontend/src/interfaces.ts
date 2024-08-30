export interface PostData {
  _id: string;
  title: string;
  content: string;
  commentCount: number;
  likedCount: number;
  thumbnailId?: string;
  tags: string[];
  user: {
    firstname: string;
    lastname: string;
    username: string;
    description?: string;
    profilePictureId?: string;
  };
  totalPageCount: number;
}