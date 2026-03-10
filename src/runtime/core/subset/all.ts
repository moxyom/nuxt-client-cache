import { shallowRef, triggerRef, type ShallowRef } from "vue"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { CacheError } from "../../types/errors"
import { createItemListModifier } from "../modifiers/list"
import { get } from "../collection/get"
import { getSubsetStore, watchEffectAndWaitForFirstRun } from "../utils"

export function createAllFunction<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string
>(
    collectionName: string,
    subsetName: string,
) {
    return async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ): Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>> => {

        // read store
        const { cache, collectionStore, subset, runWithContext } = getSubsetStore(
            collectionName, 
            subsetName
        )

        if (subset.fetchAll == undefined) {
            throw new Error(
                `Subset ${subsetName} for collection ${collectionName} does not provide a fetchAll function`
            )
        }

        if (subset.status == "empty") {

            // fetch and init store 
            const ids = await runWithContext(subset.fetchAll)
            if (ids == null) {
                return shallowRef(new CacheError(
                    "", 
                    "fetching fetch all returned null"
                ))
            }

            subset.ids.value = ids
            subset.status = "all"
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
                cache,
                collectionName,
                Object.assign({ [collectionStore.idField]: subset.ids.value[k] }, params),
            )
        )

        await watchEffectAndWaitForFirstRun(async () => {
            const ids = structuredClone(subset.ids.value)
            await listModifier(ids)
            resultRef.value = ids
        })

        return resultRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>
    }
}
