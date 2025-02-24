import { UUID } from "../../common";

export interface Comment{
    id: UUID;
    authorId: UUID;
    itemId: UUID;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetCommentsRequest{
    itemId?: UUID;
    authorId?: UUID;
    itemIds?: UUID[];
    authorIds?: UUID[];
}

export interface GetGroupedCommentsRequest{
    itemIds?: UUID[];
}