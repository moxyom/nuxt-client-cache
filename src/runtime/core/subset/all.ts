import { shallowRef, triggerRef, watchEffect, type ShallowRef } from "vue"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { CacheError } from "../../types/errors"
import type { CacheSubsetEntry } from "../../types/inner"
import { createItemListModifier } from "../modifiers/list"
import { get } from "../collection/get"
import { getCache } from "../utils"

export function createAllFunction<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string
>(
    collectionName: string,
    collectionIdField: string,
    subsetEntry: CacheSubsetEntry<Schema>,
    fetchAll: () => Promise<string[] | null>
) {
    return async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ): Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>> => {

        const collectionCache = getCache()

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
                Object.assign({ [collectionIdField]: subsetEntry.store.value[k] }, params),
            )
        )

        // create a promise to wait for first 
        // object modif to be finished
        let resolveFirstRun: () => void
        const firstRunPromise = new Promise((r) => {
            resolveFirstRun = r as () => void
        })

        const onListChange = async () => {
            const ids = structuredClone(subsetEntry.store.value)
            await listModifier(ids)
            resultRef.value = ids
            resolveFirstRun()
        }

        watchEffect(onListChange)

        // wait for the first run of 
        // modif to be effectif
        await firstRunPromise

        return resultRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>
    }
}
