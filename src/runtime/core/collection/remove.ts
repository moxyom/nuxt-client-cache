import type { CacheCollectionStore } from "../../types/inner"

export const remove = <Schema>(
    collectionEntry: CacheCollectionStore<Schema>,
    id: string
) => {
    const ref = collectionEntry.index.get(id)
    if (ref) {
        ref.value = null
    }

    collectionEntry.index.delete(id)
}
