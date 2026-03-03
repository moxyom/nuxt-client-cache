import { watchEffect, type ShallowRef } from "vue"
import type { Modifier } from "."
import { CacheError } from "../../types/errors"
import type { CacheCollectionEntry } from "../../types/inner"
import { get } from "../collection/get"
import { logger } from "@nuxt/kit"

export function createIdsModifier(
    collectionCache: Record<string, CacheCollectionEntry<unknown>>,
    foreignCollection: string,
    errorField: string,
    triggerUpdate: (err?: CacheError) => void
): Modifier {

    interface State {
        watchers: Map<string, {
            unwatch: () => void,
            foreign: ShallowRef<unknown>
            indexInList: number
        }>,
        list: unknown[],
        isInit: boolean
    }

    const state: State = {
        watchers: new Map(),
        list: [], // only stock ref
        isInit: false
    }

    const onListChange = async (ids: unknown[]): Promise<CacheError | undefined> => {

        // perform reconciliation diff
        // modify ids and create watchers
        const newWatchers: State["watchers"] = new Map()
        state.list = ids
        state.isInit = false

        const promises: Promise<void>[] = []

        for (let k = 0; k < ids.length; k++) {
            const id = ids[k]

            // check id type here, for performance
            if (typeof id != "string") {
                // throw will stop Promise.all
                return new CacheError(errorField, "must be an array of strings")
            }

            // check if watcher can be keeped
            const entry = state.watchers.get(id)
            if (entry) {

                // update the index in which 
                // the object need to be inserted
                entry.indexInList = k

                // move entry from old to new state
                newWatchers.set(id, entry)
                state.watchers.delete(id)

                // update the list
                ids[k] = entry.foreign.value
                continue
            }

            promises.push((async () => {

                // get foreign
                const foreign = await get(collectionCache, foreignCollection, id, {})
                if (foreign.value instanceof CacheError) {
                    throw foreign.value.prefixFieldWith(errorField)
                }

                const onItemValueChange = (newItemValue: unknown | CacheError) => {
                    if (newItemValue instanceof CacheError) {
                        return triggerUpdate(
                            newItemValue.prefixFieldWith(errorField)
                        )
                    }

                    const entry = state.watchers.get(id)
                    const itemIndex = entry ? entry.indexInList : -1

                    if (itemIndex == -1) {
                        logger.warn(`[mox-client-cache] modifying non existing item (${id})`)
                    }

                    // modifiy actual list
                    ids[itemIndex] = newItemValue

                    // only trigger update if liste 
                    // modifier is already initialized
                    if (!state.isInit) { triggerUpdate() }
                }

                // register watcher (will be used in onItemValueChange)
                const watcher = { foreign, indexInList: k, unwatch: () => { } }
                newWatchers.set(id, watcher)

                // launch watcher, and store unwatch function
                const unwatch = watchEffect(() => onItemValueChange(foreign.value))
                watcher.unwatch = unwatch

            })())
        }

        try {

            // wait for all ids to 
            // be turned in objects 
            await Promise.all(promises)

        } catch (err) {
            return err instanceof CacheError
                ? err
                : new CacheError(errorField, err + "")
        }

        // now every item change  
        // will trigger reactivity
        state.isInit = true

        // unwatch all of old foreign's watchers 
        for (const entry of state.watchers.values()) {
            entry.unwatch()
        }

        state.watchers = newWatchers
    }

    return onListChange
}
