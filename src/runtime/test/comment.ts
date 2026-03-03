// import { userCollection } from "../user";
import { shallowCollectionFor } from "../types";
import { defineCollection } from "./common";
import type { User } from "./user";

export interface Comment {
    id: string,
    commentBody: string,
    writer: string
}

export const commentCollection = defineCollection<Comment>("comment")
    .withShallowForeign("writer", {
        collection: shallowCollectionFor<User>("user"),
        list: true
    })
    .build()

const _test = await commentCollection({
    id: "",
    withWriter: true
})
