import { shallowRef, triggerRef, type ShallowRef } from "vue"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { CacheError } from "../../types/errors"
import { createItemListModifier } from "../modifiers/list"
import { get } from "../collection/get"
import { getSubsetStore, watchEffectAndWaitForFirstRun } from "../utils"
import type { CacheSubsetStore } from "../../types/inner"

export function createIteratorFunction<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string
>(
    collectionName: string,
    subsetName: string,
) {

    const fetchNext = async (
        subset: CacheSubsetStore<Schema>, 
        step: number,
        runWithContext: <T extends () => unknown>(fn: T) => ReturnType<T> | Promise<Awaited<ReturnType<T>>>
    ) => {
        const storeLength = subset.ids.value.length

        // fetch and init store 
        const ids = await runWithContext(() => subset.fetchRange!(storeLength, storeLength + step))
        if (ids == null) {
            return new CacheError(
                "", 
                "fetching fetch all returned null"
            )
        }
       
        subset.status = ids.length < step 
            ? "all"
            : "partial"

        subset.ids.value.push(...ids)
    }
    
    return async <
        const Params extends SearchParams<Search, Foreign, IdField> & { step: number }
    >(
        params: Params
    ): Promise<{ 
        value: ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>,
        next?: () => Promise<void>
    }> => {

        const { cache, collectionStore, subset, runWithContext } = getSubsetStore<Schema>(
            collectionName,
            subsetName
        )

        if (subset.fetchRange == undefined) {
            throw new Error(
                `Subset ${subsetName} for collection ${collectionName} does not provide a fetchRange function`
            )
        }

        // init subset if empty
        if (subset.status == "empty") {
            await fetchNext(subset, params.step, runWithContext)
        }
       
        // create refs that will be return
        const contentRef: ShallowRef<string[] | CacheError> = shallowRef(
            new CacheError("internal", "not yet initialize")
        )

        // create a function that will be return
        const next = async () => {
            const error = await fetchNext(subset, params.step, runWithContext)
            if (error) {
                contentRef.value = error
            }
        }

        const result = { 
            value: contentRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>,
            next: next as (() => Promise<void>) | undefined
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
                cache,
                collectionName,
                Object.assign({ [collectionStore.idField]: subset.ids.value[k] }, params)
            )
        )

        // when subsetEntry.store changes,n execute listModifier
        await watchEffectAndWaitForFirstRun(async () => {
            const ids = structuredClone(subset.ids.value)
            await listModifier(ids)

            contentRef.value = ids
            if (subset.status == "all") {
                result.next = undefined
            }
        })
       
        return result

    }
}
