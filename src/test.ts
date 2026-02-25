import type { CollectionBuilder } from "./runtime/types/builder"
import { CacheError } from "./runtime/types/errors"
import bookCollection from "./test2"

export const useCollectionBuilder = null as any as <Schema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

// -------------------------

const fetchUser = async (id: string) => {
    return { id, name: "coucou" + id, age: 19, myBooks: ["livre"], users: [] }
}

const fetchUserByName = async (name: string) => {
    return { id: "user", name: name, age: 19, myBooks: ["livre"], users: [] }
}

const fetchAllUsers = async () => {
    return ["user"]
}


const commentCache = useCollectionBuilder<Comment>("comment", fetchCommentById /*fonction async*/)
    .withForeign("user_slug_field", userCache, { searchBy: "slug" })
    .build()

const postCache = useCollectionBuilder<Post>("post", fetchPostById /*fonction async*/)
    .withForeign("comments_list_field", commentCache, { list: true })
    .build()

const userCache = useCollectionBuilder<User>("user", fetchUserById /*fonction async*/)
    .withCustomSearch("slug", fetchUserBySlug /*fonction async*/)
    .withForeign("posts_list_field", postCache, { list: true })
    .withSubset("all", { fetchAll: fetchAllUsers, isIncluded: isUserIncludedInAll })
    .build()





// -------------

export interface Category {
    id: string,
    name: string
}

export interface Book {
    id: string
    title: string
    category: string
    user: string
}

export interface User {
    id: string
    name: string
    age: number,
    myBooks: string[]
    users: string[]
}

const userCollection = useCollectionBuilder<User>("user", fetchUser)
    .withCustomSearch("name", fetchUserByName)
    .withSubset("all", { fetchAll: fetchAllUsers, isIncluded: () => true })
    .build()

export default userCollection


const user = await userCollection({
    id: "kygez",
})

if (!(user.value instanceof CacheError)) {
    user.value.myBooks.map((b) => {
        b.category.
    })
}
