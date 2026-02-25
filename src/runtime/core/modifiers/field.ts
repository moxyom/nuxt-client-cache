import { shallowRef, watchEffect, type ShallowRef } from "vue"
import type { Modifier } from "."
import { CacheError } from "../../types/errors"
import type { CacheCollectionEntry } from "../../types/inner"
import { get } from "../collection/get"

export function createIdFieldModifier (
    collectionCache: Record<string, CacheCollectionEntry<any>>,
    currentCollection: string,
    fieldName: string,
    foreignCollection: string,
    triggerUpdate: (err?: CacheError) => void
): Modifier {

    interface State {
        unwatch: () => void
        id: string
        foreign: ShallowRef<any>
        object: any
        isInit: boolean
    }

    // cache state, if same id as before, 
    // reuse same foreign and watcher
    // TS: ne need to polluate with empty 
    // properties, like they will be set
    const state = {
        unwatch: () => { },
        id: undefined,
    } as any as State

    const onObjectChange = async (object: any) => {

        state.object = object
        state.isInit = false

        // check that field exist and get the id
        if (fieldName! in object) {
            return new CacheError(
                `${currentCollection}.${fieldName}`,
                `field not found`
            )
        }

        // check id's type
        const id = object[fieldName]
        if (typeof id != "string") {
            return new CacheError(
                `${currentCollection}.${fieldName}`,
                `must be a string (not ${typeof id})`
            )
        }

        // check if prev watcher can be keeped
        if (state.id == id) {

            // modify objet
            object[fieldName] = state.foreign.value
            return
        }

        // field has changed, stop watcher
        state.unwatch()

        const onFieldValueChange = (newFieldValue: any | CacheError) => {
            if (newFieldValue instanceof CacheError) {
                return triggerUpdate(
                    newFieldValue.prefixFieldWith(`${currentCollection}.${fieldName}`)
                )
            }

            state.object[fieldName] = newFieldValue

            // don't trigger on initialization
            if (state.isInit) {
                triggerUpdate()
            }
        }

        // get foreign field
        const foreign = await get(collectionCache, foreignCollection, id, {})
        if (foreign.value instanceof CacheError) {
            return foreign.value.prefixFieldWith(`${currentCollection}.${fieldName}`)
        }

        // create new watcher
        const unwatch = watchEffect(() => onFieldValueChange(foreign.value))

        // update state
        Object.assign(state, { id, foreign, unwatch, isInit: true })
    }

    return onObjectChange
}
