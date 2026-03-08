import { watchEffect, type ShallowRef } from "vue"
import type { Modifier } from "."
import { CacheError } from "../../types/errors"
import type { CacheCollectionEntry } from "../../types/inner"
import { get } from "../collection/get"
import type { ReturnTypeFor, SearchParams } from "../../types"
import { stableStringify } from "../utils"

export function createItemFieldModifier<
    Schema extends Record<string, unknown>,
    Field extends keyof Schema & string,
    FSchema extends Record<string, unknown>,
    FIdField extends string,
    FSearch,
    FForeign,
    FParams extends SearchParams<FSearch, FForeign, FIdField>
>(
    collectionCache: Record<string, CacheCollectionEntry<unknown>>,
    currentCollection: string,
    fieldName: Field,
    foreignCollection: string,
    triggerUpdate: (err?: CacheError) => void,
    toParams: (o: Schema) => FParams
): Modifier<Schema> {

    interface State {
        unwatch: () => void
        itemStr: string
        foreign: ShallowRef<ReturnTypeFor<FSchema, FForeign, FParams>>
        object: Schema
        isInit: boolean
    }

    // cache state, if same param as before, 
    // reuse same foreign and watcher
    // TS: no need to polluate with empty 
    // properties, like they will be set
    const state = {
        unwatch: () => { },
        itemStr: "",
    } as unknown as State

    const onObjectChange = async (
        object: Schema
    ) => {

        state.object = object
        state.isInit = false

        const item = object[fieldName]
        const itemStr = stableStringify(item)

        // check if prev watcher can be keeped
        if (state.itemStr == itemStr) {

            // modify objet
            object[fieldName] = state.foreign.value as Schema[Field]
            return
        }

        // field has changed, stop watcher
        state.unwatch()

        const onFieldValueChange = (
            newFieldValue: ReturnTypeFor<FSchema, FForeign, FParams> | CacheError
        ) => {
            if (newFieldValue instanceof CacheError) {
                return triggerUpdate(
                    newFieldValue.prefixFieldWith(`${currentCollection}.${fieldName}`)
                )
            }

            state.object[fieldName] = newFieldValue as Schema[Field]

            // don't trigger on initialization
            if (state.isInit) {
                triggerUpdate()
            }
        }

        // get foreign field
        const foreign = await get<FSchema, FSearch, FForeign, FIdField, FParams>(
            collectionCache, 
            foreignCollection, 
            toParams(object)
        )

        if (foreign.value instanceof CacheError) {
            return triggerUpdate(
                foreign.value.prefixFieldWith(`${currentCollection}.${fieldName}`)
            )
        }

        // create new watcher
        const unwatch = watchEffect(() => onFieldValueChange(foreign.value))

        // update state
        Object.assign(state, { itemStr, foreign, unwatch, isInit: true })
    }

    return onObjectChange
}
