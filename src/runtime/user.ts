import { postCollection } from "./posts"
import type { CollectionBuilder } from "./types/builder"
import { CacheError } from "./types/errors"
import type { BaseSchema } from "./types/common"

const useCollectionBuilder = null as unknown as <Schema extends BaseSchema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

type User = {
    id: string,
    posts: string[]
    age: number,
}

const fetchUser = async() => { return {} as User }


export const userCollection = useCollectionBuilder("user", fetchUser)
    .withForeign("posts", postCollection, { list: true })
    .build()

const user = await userCollection({
    id: "true",
    withPosts: { withComments: true }
})

if (user.value instanceof CacheError) {
    throw "pas cook"
}else {
    user.value.posts.forEach((p) => {
        console.log(p.comments)
    })
}
