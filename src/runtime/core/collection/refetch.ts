import { shallowRef } from "vue";
import type { CacheCollectionStore } from "../../types/inner";

export const refetch = async <Schema>(
    collectionEntry: CacheCollectionStore<Schema>,
    id: string
) => {
    const ress = await collectionEntry.fetch(id)
    let ref = collectionEntry.index.get(id)

    if (ref == undefined) {
        ref = shallowRef(null)
        collectionEntry.index.set(id, ref)
    }

    ref.value = ress
}
