import { postCollection } from "./post";
import { defineCollection } from "./common";

export interface User {
    id: string,
    username: string,
    age: number,
    posts: string[]
}

export const userCollection = defineCollection<User>("user")
    .withSearch("username", async (_p: { pute: string }) => { return null })
    .withSearch("posts", async (_p: { pute2: number }) => { return null })
    .withForeign("posts", { collection: postCollection, list: true })
    .build()

const _test = await userCollection({ 
    withPosts: {
        withComments: true
    }
})
