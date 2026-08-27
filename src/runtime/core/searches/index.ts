import { computed, ref, type Ref, type ShallowRef } from "vue"
import { InternalError, NotFoundError } from "../../types/errors"
import { paramsToSearchParamsAndExtras, withify } from "../utils"
import {
    anyToCacheError,
    createErrorMultiplexer,
    safeExecuteProvidedFunction,
} from "../utils/errors"
import { getIdFor } from "./custom-searches"
import { handleProvides } from "../storage/provides"
import { store } from "../storage"
import { decorateRecord } from "../editables"
import { applyVField } from "../vfileds"
import { createCacheContext, type CacheContext } from "../context"
import { getCache } from "../utils/cache-provider"

export const search = async (
    ctx: CacheContext,
    collectionName: string,
    searchParams: Record<string, unknown>,
    extras: Record<string, unknown>,
    onDone: (object: Record<string, unknown>) => void,
): Promise<void> => {
    const { collectionStore } = ctx.getCollectionStore(collectionName)

    const maybeRefId =
        "searchBy" in searchParams
            ? await getIdFor(
                  ctx,
                  collectionName,
                  searchParams.searchBy as string,
                  searchParams,
                  extras,
              )
            : (searchParams[collectionStore.idField] as string)

    // watch with error handling params to id association
    await ctx.watch(maybeRefId, async (id, idCtx) => {
        // if the id is null, it means that the record have been
        // search by a custom search and like the ref returned by
        // getIdFor is mandatory not null at first (NotFoundError throwned)
        // then the search params to id association have been
        // set to null, mandatory by a record unstored
        if (id === null)
            throw new NotFoundError(
                `record from collection ${collectionName} searched with ` +
                    `by ${JSON.stringify(searchParams)} have been unstored`,
            )

        // try get the record from the store
        let storedRecord = collectionStore.index.get(id)

        // fetch the actual record by id
        if (storedRecord === undefined) {
            // call provided search function
            const ress = await safeExecuteProvidedFunction(
                ctx,
                collectionName,
                "search by id",
                () => collectionStore.fetch({ id }, extras),
            )

            if (!ress)
                throw new NotFoundError(
                    `unable to find ${collectionName} record (searching by id)`,
                )

            // store returned records
            if (ress.provides) handleProvides(ctx, ress.provides)
            storedRecord = store(ctx, collectionName, ress.record)
        }

        // storedRecord can now not be undefined
        const recordRef = storedRecord as ShallowRef<Record<
            string,
            unknown
        > | null>

        // watch with error handling record changes
        await idCtx.watch(recordRef, async (recordValue, recordCtx) => {
            if (recordValue === null)
                throw new NotFoundError(
                    `record from collection ${collectionName} ` +
                        "searched by id have been unstored",
                )

            const decoratedRecord = decorateRecord(
                ctx,
                collectionName,
                recordValue,
            )

            const vFiledPromises: Promise<void>[] = []
            for (const vFieldName of Object.keys(collectionStore.vFields)) {
                const withifyKey = withify(vFieldName)
                const subExtra = extras[withifyKey]
                if (!subExtra) continue

                vFiledPromises.push(
                    applyVField(
                        recordCtx,
                        collectionName,
                        vFieldName,
                        decoratedRecord,
                        typeof subExtra == "boolean"
                            ? {}
                            : (subExtra as Record<string, unknown>),
                    ),
                )
            }

            await Promise.all(vFiledPromises)
            onDone(decoratedRecord)
        })
    })
}

export const createSearchFunction = (collectionName: string) => {
    return async (params: Record<string, unknown>) => {
        const cache = getCache()
        const errorMultiplexer = createErrorMultiplexer()
        const ctx = createCacheContext(cache, errorMultiplexer)

        const finalObject: Ref<Record<string, unknown> | null> = ref(null)

        try {
            const { searchParams, extras } = paramsToSearchParamsAndExtras(
                ctx,
                collectionName,
                params,
            )

            await search(
                ctx,
                collectionName,
                searchParams,
                extras,
                (value) => (finalObject.value = value),
            )
        } catch (e: unknown) {
            errorMultiplexer.register(anyToCacheError(e))
        }

        return computed(() => {
            const error = errorMultiplexer.errorRef.value
            if (error) return error

            const finalObjectValue = finalObject.value
            if (finalObjectValue === null) {
                return new InternalError(
                    "final object must not be null when no error registered",
                )
            }

            return finalObjectValue
        })
    }
}
