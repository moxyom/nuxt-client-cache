// import { userCollection } from "../user";
import { defineCollection } from "./common";

interface Comment {
    id: string,
    commentBody: string,
    writer: string
}

export const commentCollection = defineCollection<Comment>("comment")
    .build()
