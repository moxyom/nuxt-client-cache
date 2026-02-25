import type { CollectionBuilder } from "./types/builder"

const useCollectionBuilder = null as unknown as <Schema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

type Comment = {
    id: string,
    writer: string,
    commentBody: string
}

const fetchComment = async() => { return {} as Comment }

export const commentCollection = useCollectionBuilder("comment", fetchComment)
    .build()
