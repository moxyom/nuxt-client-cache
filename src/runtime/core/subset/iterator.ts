import { shallowRef, triggerRef, watchEffect, type ShallowRef } from "vue"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { CacheError } from "../../types/errors"
import type { CacheSubsetEntry } from "../../types/inner"
import { createItemListModifier } from "../modifiers/list"
import { get } from "../collection/get"
import { getCache } from "../utils"

export function createIteratorFunction<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string
>(
    collectionName: string,
    collectionIdField: string,
    subsetEntry: CacheSubsetEntry<Schema>,
    fetchRange: (start: number, end: number) => Promise<string[] | null>
) {

    const fetchNext = async (step: number) => {
        const storeLength = subsetEntry.store.value.length

        // fetch and init store 
        const ids = await fetchRange(storeLength, storeLength + step)
        if (ids == null) {
            return new CacheError(
                "", 
                "fetching fetch all returned null"
            )
        }
       
        subsetEntry.status = ids.length < step 
            ? "all"
            : "partial"

        subsetEntry.store.value = ids
    }
    
    return async <
        const Params extends SearchParams<Search, Foreign, IdField> & { step: number }
    >(
        params: Params
    ): Promise<{ 
        value: ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>,
        next?: () => Promise<undefined>
    }> => {

        const collectionCache = getCache()

        if (subsetEntry.status == "empty") {
        
            // fetch and init store 
            const ids = await fetchRange(0, params.step)
            if (ids == null) {
                return { 
                    value: shallowRef(new CacheError(
                        "", 
                        "fetching fetch all returned null"
                    ))
                }
            }
       
            subsetEntry.store.value = ids
            subsetEntry.status = "partial"
        }
       
        // create refs that will be return
        const contentRef: ShallowRef<string[] | CacheError> = shallowRef(
            new CacheError("internal", "not yet initialize")
        )

        const result = { 
            value: contentRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>,
            next: (
                async () => {
                    const error = await fetchNext(params.step)
                    if (error) {
                        contentRef.value = error
                    }
                }
            ) as (() => Promise<undefined>) | undefined
        }
       
        const triggerUpdate = (err?: CacheError) => {
            if (err) {
                contentRef.value = err 
            }else {
                triggerRef(contentRef)
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

        // create a promise to wait for first 
        // object modif to be finished
        let resolveFirstRun: () => void
        const firstRunPromise = new Promise((r) => {
            resolveFirstRun = r as () => void
        })
       
        const onListChange = async () => {
            const ids = structuredClone(subsetEntry.store.value)
            await listModifier(ids)
            contentRef.value = ids
            if (subsetEntry.status == "all") {
                result.next = undefined
            }

            resolveFirstRun()
        }
       
        watchEffect(onListChange)

        // wait for the first run of 
        // modif to be effectif
        await firstRunPromise
       
        return result

    }
}
