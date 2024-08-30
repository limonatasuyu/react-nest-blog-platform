export interface GetPostsDTO {
  page: number;
  tag?: string;
  username?: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  thumbnailId?: string;
  tags: string[];
}

export interface DeletePostDTO {
  postId: string;
}

export interface UpdatePostDTO {
  postId: string;
  title: string;
  content: string;
  thumbnailId?: string;
  tags: string[];
}
