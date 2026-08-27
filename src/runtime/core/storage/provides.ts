import { store } from "."
import type { ProvidesRecord } from "../../types/definitions"
import type { CacheContext } from "../context"

export const handleProvides = (ctx: CacheContext, provides: ProvidesRecord) => {
    for (const [collectionName, objects] of Object.entries(provides)) {
        for (const object of objects) {
            store(ctx, collectionName, object)
        }
    }
}
