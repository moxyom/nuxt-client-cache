import { mocked as userMocked, userCollection } from "./users"
import { mocked as postMocked, postCollection } from "./posts"
import { mocked as commentMocked, commentCollection } from "./comments"
import type { CacheCollectionDefinition } from "~/src/runtime/types/definitions"
import { collectionDefinitions } from "~/src/runtime/definitions"

// empty collectionDefinitions for othe@r
const datasetDefinition: Record<string, CacheCollectionDefinition<unknown>> = {}
Object.keys(collectionDefinitions).forEach((key) => {
    datasetDefinition[key] = collectionDefinitions[key]!
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete collectionDefinitions[key]
})

export const usersPostsCommentsDataset = {
    definitions: datasetDefinition,
    collections: {
        userCollection,
        postCollection,
        commentCollection,
    },
    mocked: {
        ...userMocked,
        ...postMocked,
        ...commentMocked,
    },
}
