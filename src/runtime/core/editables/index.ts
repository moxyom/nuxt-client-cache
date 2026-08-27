import { stableStringify } from "../utils"
import type { ObjectFunctions } from "../../types/collection"
import {
    anyToCacheError,
    createErrorMultiplexer,
    safeExecuteProvidedFunction,
} from "../utils/errors"
import { store, unstore } from "../storage"
import { InternalError, NotFoundError } from "../../types/errors"
import { handleProvides } from "../storage/provides"
import { createCacheContext, type CacheContext } from "../context"
import { getCache } from "../utils/cache-provider"

const createReloadFunction = (collectionName: string, id: string) => {
    return async () => {
        const cache = getCache()
        const errorMultiplexer = createErrorMultiplexer()
        const ctx = createCacheContext(cache, errorMultiplexer)

        try {
            const { collectionStore } = ctx.getCollectionStore(collectionName)
            const ress = await safeExecuteProvidedFunction(
                ctx,
                collectionName,
                "search by id",
                () => collectionStore.fetch({ id }, {}),
            )

            if (!ress) {
                unstore(ctx, collectionName, id)
                return new NotFoundError("record not found when reloading")
            }

            if (ress.provides) handleProvides(ctx, ress.provides)
            store(ctx, collectionName, ress.record)

            return true
        } catch (e) {
            return anyToCacheError(e)
        }
    }
}

export const decorateRecord = <Schema>(
    ctx: CacheContext,
    collectionName: string,
    record: Schema,
) => {
    const { collectionStore } = ctx.getCollectionStore(collectionName)

    const decoratedRecord = structuredClone(record) as Schema &
        ObjectFunctions<Schema, unknown>
    const id = (decoratedRecord as Record<string, string>)[
        collectionStore.idField
    ]!

    decoratedRecord.reload = createReloadFunction(collectionName, id)
    // decorateRecord.createEditadble = () => createEditable(collectionName, structuredClone(record))

    return decoratedRecord
}

export const decorateScope = <Schema>(
    ctx: CacheContext,
    collectionName: string,
    scopeName: string,
    searchParams: Record<string, unknown>,
    extras: Record<string, unknown>,
    list: Schema[],
) => {
    const { scopeStore } = ctx.getScopeStore(collectionName, scopeName)
    const searchParamsStr = stableStringify(searchParams)
    const scopeEntry = scopeStore.perParams.get(searchParamsStr)
    if (!scopeEntry)
        throw new InternalError(
            `unable to find scope entry for collection ${collectionName} ` +
                `scope ${scopeName} and params ${searchParamsStr} in decorateList`,
        )

    Object.assign(list, {
        status: () => scopeEntry.status,
        fetchNext: async (n: number) => {
            if (scopeEntry.status.value != "incomplete") return
            if (!scopeStore.fetchRange)
                throw new InternalError(
                    `no fetchRange function for collection ${collectionName} ` +
                        `scope ${scopeName} and search params ${searchParamsStr} ` +
                        "while  status is incomplete",
                )

            scopeEntry.status.value = "loading"
            const idNumber = scopeEntry.ids.value.length
            const ress = await safeExecuteProvidedFunction(
                ctx,
                collectionName,
                `search ${scopeName} scope ids`,
                () => {
                    return scopeStore.fetchRange!(
                        idNumber,
                        idNumber + n,
                        searchParams,
                        extras,
                    )
                },
            )

            if (!ress) {
                scopeEntry.status.value = "not-found"
                return
            }

            if (ress.provides) handleProvides(ctx, ress.provides)
            scopeEntry.ids.value = [...scopeEntry.ids.value, ...ress.ids]
        },
    })

    return list
}

export const createEditable = <Schema>(
    _collectionName: string,
    _record: Schema,
) => {
    throw "Not yet implemented"
}

export const createCreateEditableFunction = <Schema>(
    _collectionName: string,
) => {
    return (_defaultObject: Schema) => {
        throw "Not yet implemented"
    }
}
