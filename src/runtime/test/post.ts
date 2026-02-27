import { commentCollection } from "../comments";
import { defineCollection } from "./common";

interface Post {
    id: string,
    postBody: string,
    comments: string[]
}

export const postCollection = defineCollection<Post>("post", {
    foreign: {
        comments: { collection: commentCollection, isList: true }
    }
})
