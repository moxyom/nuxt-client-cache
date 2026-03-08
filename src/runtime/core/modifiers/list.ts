import { watchEffect, type ShallowRef } from "vue"
import type { Modifier } from "."
import { CacheError } from "../../types/errors"
import { stableStringify } from "../utils"

export function createItemListModifier<
    ItemBefore, 
    ItemAfter
>(
    errorField: string,
    triggerUpdate: (err?: CacheError) => void,
    modify: (k: number) => Promise<ShallowRef<ItemAfter | CacheError>>,
): Modifier<ItemBefore[]> {

    interface State {
        store: Map<string, {
            unwatch: () => void,
            foreign: ShallowRef<ItemAfter | CacheError>
            indexInList: number
        }>,
        list: (ItemBefore | ItemAfter)[],
        isInit: boolean
    }

    const state: State = {
        store: new Map(),
        list: [], // only stock ref
        isInit: false
    }

    const onListChange = async (
        itemList: (ItemBefore | ItemAfter)[]
    ) => {

        // perform reconciliation diff
        // modify list and create newStore
        const newStore: State["store"] = new Map()
        state.list = itemList
        state.isInit = false

        const promises: Promise<void>[] = []

        for (let k = 0; k < itemList.length; k++) {
            const item = itemList[k]!
            const itemStr = stableStringify(item)

            // check if watcher can be keeped
            const entry = state.store.get(itemStr)
            if (entry) {

                // update the index in which 
                // the object need to be inserted
                entry.indexInList = k

                // move entry from old to new state
                newStore.set(itemStr, entry)
                state.store.delete(itemStr)

                // update the list
                const storedValue = entry.foreign.value
                if (storedValue instanceof CacheError) {
                    return triggerUpdate(storedValue.prefixFieldWith(errorField))
                }

                itemList[k] = storedValue
                continue
            }

            promises.push((async () => {

                // get foreign
                const foreign = await modify(k)
                if (foreign.value instanceof CacheError) {
                    return triggerUpdate(
                        foreign.value.prefixFieldWith(errorField)
                    )
                }

                const onItemValueChange = (newItemValue: ItemAfter | CacheError) => {
                    if (newItemValue instanceof CacheError) {
                        return triggerUpdate(
                            newItemValue.prefixFieldWith(errorField)
                        )
                    }

                    const entry = state.store.get(itemStr)
                    const itemIndex = entry ? entry.indexInList : -1

                    if (itemIndex == -1) {
                        console.warn(`[mox-client-cache] modifying non existing item (${item})`)
                    }

                    // modifiy actual list
                    itemList[itemIndex] = newItemValue

                    // only trigger update if liste 
                    // modifier is already initialized
                    if (!state.isInit) { triggerUpdate() }
                }

                // register watcher (will be used in onItemValueChange)
                const entry = { foreign, indexInList: k, unwatch: () => { } }
                newStore.set(itemStr, entry)

                // launch watcher, and store unwatch function
                const unwatch = watchEffect(() => onItemValueChange(foreign.value))
                entry.unwatch = unwatch

            })())
        }

        try {

            // wait for all ItemBefore to 
            // be turned in ItemAfter 
            await Promise.all(promises)

        } catch (err) {
            return triggerUpdate(
                err instanceof CacheError
                    ? err
                    : new CacheError(errorField, err + "")
            )
        }

        // now every item change  
        // will trigger reactivity
        state.isInit = true

        // unwatch all of old foreign's watchers 
        for (const entry of state.store.values()) {
            entry.unwatch()
        }

        state.store = newStore
    }

    return onListChange
}
