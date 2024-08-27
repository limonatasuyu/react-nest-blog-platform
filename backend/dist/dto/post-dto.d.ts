export interface GetPostsByTagDTO {
    tag: string;
    page: number;
}
export interface GetRecentPostsDTO {
    page: number;
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
