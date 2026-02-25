import type { CacheCollectionEntry, Subset } from "@/src/runtime/types/inner";
import type { CollectionBuilded, ToParams } from "@/src/runtime/types/public";
import { get } from "./get";
import { store } from "./store";
import { remove } from "./remove";
import { refetch } from "./refetch";
import { createSubset } from "../subset";

export const createCollection = <
    Schema,
    Foreign,
    Subsets extends Subset
>(
    collectionCache: Record<string, CacheCollectionEntry<any>>,
    collectionEntry: CacheCollectionEntry<Schema>,
    collectionName: string,
): CollectionBuilded<Schema, Foreign, Subsets> => {

    const fn = async <const Params extends ToParams<Foreign>>(
        id: string, 
        params: Params
    ) => {
        return get<Schema, Foreign, Params>(collectionCache, collectionName, id, params)
    }

    Object.assign(fn, {
        store: (object: Schema) => store(object),
        remove: (id: string) => remove(id),
        reftech: async (id: string) => refetch(id)
    })

    for (const [subsetName, entry] of Object.entries(collectionEntry.subsets)) {
        (fn as any)[subsetName] = createSubset(entry)
    }

    return fn as any
}

export default {
    createCollection
}
