import { commentCollection } from "./comment";
import { defineCollection } from "./common";

export interface Post {
    id: string,
    slug: string,
    postBody: string,
    comments: string[]
}

export const postCollection = defineCollection<Post>("post")
    .withSearch("slug", async (_o: { slug: string }) => null)
    .withForeign("comments", { collection: commentCollection, list: true })
    .build()
