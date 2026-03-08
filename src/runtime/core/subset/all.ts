import { shallowRef, triggerRef, watchEffect, type ShallowRef } from "vue"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { CacheError } from "../../types/errors"
import type { CacheCollectionEntry, CacheSubsetEntry } from "../../types/inner"
import { createItemListModifier } from "../modifiers/list"
import { get } from "../collection/get"

export function createAllFunction<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string
>(
    collectionCache: Record<string, CacheCollectionEntry<unknown>>,
    collectionName: string,
    collectionIdField: string,
    subsetEntry: CacheSubsetEntry<Schema>,
    fetchAll: () => Promise<string[] | null>
) {
    return async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ): Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>> => {

        if (subsetEntry.status == "empty") {

            // fetch and init store 
            const ids = await fetchAll()
            if (ids == null) {
                return shallowRef(new CacheError(
                    "", 
                    "fetching fetch all returned null"
                ))
            }

            subsetEntry.store.value = ids
            subsetEntry.status = "all"
        }

        // create ref that will be return
        const resultRef: ShallowRef<string[] | CacheError> = shallowRef(
            new CacheError("internal", "not yet initialize")
        )

        const triggerUpdate = (err?: CacheError) => {
            if (err) {
                resultRef.value = err 
            }else {
                triggerRef(resultRef)
            }
        }

        const listModifier = createItemListModifier(
            "subset",
            triggerUpdate,
            (k: number) => get<Schema, Search, Foreign, IdField, Params>(
                collectionCache,
                collectionName,
                Object.assign({ [collectionIdField]: subsetEntry.store.value[k] }, params)
            )
        )

        const onListChange = async () => {
            const ids = structuredClone(subsetEntry.store.value)
            await listModifier(ids)
            resultRef.value = ids
        }

        watchEffect(onListChange)

        return resultRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>
    }
}
