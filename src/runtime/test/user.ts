import { postCollection } from "../posts";
import { defineCollection } from "./common";

interface User {
    id: string,
    username: string,
    age: number,
    posts: string[]
}

export const userCollection = defineCollection<User>("user", {
    foreign: {
        posts: { collection: postCollection, isList: true }
    },
    search: {
        username: async (params: { username: string }) => {
            return {
                id: "",
                username: params.username,
                age: 18,
                posts: []
            }
        }
    }
})

userCollection({ id: "" })
