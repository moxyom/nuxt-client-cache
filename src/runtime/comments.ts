import type { CollectionBuilder } from "./types/builder"
import type { BaseSchema } from "./types/common"

const useCollectionBuilder = null as unknown as <Schema extends BaseSchema>(name: string, fetch: (id: string) => Promise<Schema | null>) => CollectionBuilder<Schema>

type Comment = {
    id: string,
    commentSlug: string
    writer: string,
    commentBody: string
}

const fetchComment = async() => { return {} as Comment }

export const commentCollection = useCollectionBuilder("comment", fetchComment)
    .withCustomSearch("commentSlug", async (commentSlug: string) => { return { } as Comment})
    .build()
