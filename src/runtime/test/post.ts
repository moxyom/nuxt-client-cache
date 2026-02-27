import { commentCollection } from "./comment";
import { defineCollection } from "./common";

interface Post {
    id: string,
    postBody: string,
    comments: string[]
}

export const postCollection = defineCollection<Post>("post")
    .withForeign("comment", { collection: commentCollection, list: true })
    .build()
