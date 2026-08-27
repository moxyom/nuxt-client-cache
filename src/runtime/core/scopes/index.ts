import { computed, ref, shallowRef, type Ref } from "vue"
import { InternalError, NotFoundError } from "../../types/errors"
import { handleProvides } from "../storage/provides"
import { paramsToSearchParamsAndExtras, stableStringify } from "../utils"
import {
    anyToCacheError,
    createErrorMultiplexer,
    safeExecuteProvidedFunction,
} from "../utils/errors"
import { decorateScope } from "../editables"
import { search } from "../searches"
import { createCacheContext, type CacheContext } from "../context"
import { getCache } from "../utils/cache-provider"

export const scopeAccess = async (
    ctx: CacheContext,
    collectionName: string,
    scopeName: string,
    searchParams: Record<string, unknown>,
    extras: Record<string, unknown>,
    onDone: (object: Record<string, unknown>[]) => void,
) => {
    const { collectionStore, scopeStore } = ctx.getScopeStore(
        collectionName,
        scopeName,
    )

    const searchParamsStr = stableStringify(searchParams)
    let scopeEntry = scopeStore.perParams.get(searchParamsStr)
    if (!scopeEntry) {
        const [searchFn, all] = scopeStore.fetchAll
            ? [() => scopeStore.fetchAll!(searchParams, extras), true]
            : [() => scopeStore.fetchRange!(0, 12, searchParams, extras), false]

        const ress = await safeExecuteProvidedFunction(
            ctx,
            collectionName,
            `search ${scopeName} scope ids`,
            searchFn,
        )

        if (!ress)
            throw new NotFoundError(
                `unable to find ${collectionName} scope ${scopeName} ` +
                    `(searching with ${searchParamsStr})`,
            )

        if (ress.provides) handleProvides(ctx, ress.provides)

        scopeEntry = {
            ids: shallowRef(ress.ids),
            status: ref(all ? "complete" : "incomplete"),
        }

        scopeStore.perParams.set(searchParamsStr, scopeEntry)
    }

    // watch status to catch errors when fetchNext is called
    await ctx.watch(scopeEntry!.status, async (status) => {
        if (status == "not-found")
            throw new NotFoundError(
                `collection ${collectionName} scope ${scopeName} with ` +
                    `params ${searchParamsStr} has returned a null value`,
            )
    })

    await ctx.watchList({
        from: scopeEntry!.ids,
        onDone: (buildedList) => {
            const decoratedScope = decorateScope(
                ctx,
                collectionName,
                scopeName,
                searchParams,
                extras,
                buildedList,
            ) as Record<string, unknown>[]

            onDone(decoratedScope)
        },
        map: async (id: string, itemCtx) => {
            const itemRef = ref<unknown>(null)
            await search(
                itemCtx,
                collectionName,
                { [collectionStore.idField]: id },
                extras,
                (value) => (itemRef.value = value),
            )

            return itemRef
        },
    })
}

export const createScopeAccessFunction = (
    collectionName: string,
    scopeName: string,
) => {
    return async (params: Record<string, unknown>) => {
        const cache = getCache()
        const errorMultiplexer = createErrorMultiplexer()
        const ctx = createCacheContext(cache, errorMultiplexer)

        const finalScope: Ref<Record<string, unknown>[] | null> = ref(null)

        try {
            const { searchParams, extras } = paramsToSearchParamsAndExtras(
                ctx,
                collectionName,
                params,
            )

            await scopeAccess(
                ctx,
                collectionName,
                scopeName,
                searchParams,
                extras,
                (value) => (finalScope.value = value),
            )
        } catch (e: unknown) {
            errorMultiplexer.register(anyToCacheError(e))
        }

        return computed(() => {
            const error = errorMultiplexer.errorRef.value
            if (error) return error

            const finalScopeValue = finalScope.value
            if (finalScopeValue === null) {
                return new InternalError(
                    "final object must not be null when no error registered",
                )
            }

            return finalScopeValue
        })
    }
}
