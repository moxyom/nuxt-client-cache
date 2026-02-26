import { commentCollection } from "./comments"
import type { CollectionBuilder } from "./types/builder"
import type { BaseSchema } from "./types/common"

const useCollectionBuilder = null as unknown as <Schema extends BaseSchema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

type Post = {
    id: string,
    postTitle: string,
    comments: string[]
}

const fetchPost = async() => { return {} as Post }

export const postCollection = useCollectionBuilder("post", fetchPost)
    .withForeign("comments", commentCollection, { list: true })
    .build()
