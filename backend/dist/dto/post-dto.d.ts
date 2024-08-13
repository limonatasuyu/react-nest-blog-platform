export interface GetPostsByTagDTO {
    tags: string | string[];
    page: number;
}
export interface GetRecentPostsDTO {
    page: number;
}
export interface CreatePostDTO {
    title: string;
    content: string;
    imageDataUrls: string[];
}
