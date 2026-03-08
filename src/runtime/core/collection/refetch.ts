import { shallowRef } from "vue";
import type { CacheCollectionEntry } from "../../types/inner";

export const refetch = async <Schema>(
    collectionEntry: CacheCollectionEntry<Schema>,
    id: string
) => {
    const ress = await collectionEntry.fetch(id)
    let ref = collectionEntry.store.get(id)

    if (ref == undefined) {
        ref = shallowRef(null)
        collectionEntry.store.set(id, ref)
    }

    ref.value = ress
}
