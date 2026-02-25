import type { CollectionBuilder } from "./types/builder"

const useCollectionBuilder = null as unknown as <Schema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

type Post = {
    id: string,
    postTitle: string,
    comments: string[]
}

const fetchPost = async() => { return {} as Post }

export const postCollection = useCollectionBuilder("post", fetchPost)
    .build()
