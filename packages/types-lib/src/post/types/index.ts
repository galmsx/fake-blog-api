import { UUID, PageOptions } from "../../common";
import { Comment } from "../../comment/types";


export interface Post{
    id: UUID;
    authorId: UUID;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}


export interface PostWithComments extends Post{
    comments: Comment[]
}

export interface GetPostsRequest extends PageOptions{
    authorId: UUID
}