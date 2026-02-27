import { postCollection } from "./post";
import { defineCollection } from "./common";

interface User {
    id: string,
    username: string,
    age: number,
    posts: string[]
}

export const userCollection = defineCollection<User>("user")
    .withForeign("posts", { collection: postCollection, list: true })
    .build()

userCollection({ id: "" })
