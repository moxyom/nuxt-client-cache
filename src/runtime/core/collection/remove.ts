import type { CacheCollectionEntry } from "../../types/inner";

export const remove = <Schema>(
    collectionEntry: CacheCollectionEntry<Schema>,
    id: string
) => {
    const ref = collectionEntry.store.get(id)
    if (ref) {
        ref.value = null
    }

    collectionEntry.store.delete(id)
}
