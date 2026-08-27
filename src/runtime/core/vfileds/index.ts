import { scopeAccess } from "../scopes"
import { search } from "../searches"
import type { CacheContext } from "../context"

export const applyVField = async <Schema>(
    ctx: CacheContext,
    collectionName: string,
    vFieldName: string,
    record: Schema,
    subExtra: Record<string, unknown>,
) => {
    const { vFieldStore } = ctx.getVFieldStore(collectionName, vFieldName)

    const vFieldCollectionName = vFieldStore.collection()
    const params = vFieldStore.toParams(record) as Record<string, unknown>

    const onDone = (vFieldValue: unknown) => {
        ;(record as Record<string, unknown>)[vFieldName] = vFieldValue
    }

    if (typeof vFieldStore.scope == "string") {
        await scopeAccess(
            ctx,
            vFieldCollectionName,
            vFieldStore.scope,
            params,
            subExtra,
            onDone,
        )
    } else {
        await search(ctx, vFieldCollectionName, params, subExtra, onDone)
    }
}
