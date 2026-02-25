import { shallowRef, triggerRef, unref, watchEffect, type ShallowRef } from "vue";
import type { CacheCollectionEntry } from "@/src/runtime/types/inner";
import type { GetReturn, ToParams } from "@/src/runtime/types/public";
import { CacheError } from "@/src/runtime/types/errors";
import type { Modifier } from "../../modifiers";
import { createIdsFieldMofifier } from "../../modifiers/list-field";
import { createIdFieldModifier } from "../../modifiers/field";

export function pluralize(str: string) {
    if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies'
    }

    return str + 's'
}

export function paramsNameFor(collectionName: string, idList: boolean) {
    const base = idList ? pluralize(collectionName) : collectionName
    return `with${base.charAt(0).toUpperCase()}${base.slice(1)}`
}

export async function get<
    Schema,
    Foreign,
    const Params extends ToParams<Foreign>
>(
    collectionCache: Record<string, CacheCollectionEntry<any>>,
    collectionName: string,
    id: string,
    params: Params
): GetReturn<Schema, Foreign, Params> {

    const collectionEntry = collectionCache[collectionName] as CacheCollectionEntry<Schema> | undefined
    if (!collectionEntry) {
        return shallowRef(new CacheError(
            collectionName,
            "No collection found for " + collectionName
        ))
    }

    const stored = collectionEntry.store.get(id)
    let objectRef = stored ? stored : shallowRef(null)

    // try get the object from the store
    if (!objectRef) {

        // fetch the object
        const fetchedObject: Schema | null = await collectionEntry.fetch(id)
        if (!fetchedObject) {
            return shallowRef(new CacheError(
                collectionName,
                "unable to fetch resource"
            ))
        }

        // store fetched resource
        objectRef = shallowRef(unref(fetchedObject))
        collectionEntry.store.set(id, objectRef)

    }

    // create ref that will be return
    const resultRef: ShallowRef<any | CacheError> = shallowRef(new CacheError("internal", "not yet initialize"))
    const triggerUpdate = (err?: CacheError) => {
        if (err) {
            resultRef.value = err 
        }else {
            triggerRef(resultRef)
        }
    }

    // init modifiers, each modification applyed 
    // to the object in terms of foreign key(s) 
    // are modifiers : a function that transform 
    // the object, and call triggerUpdate when sub 
    // object change, for reactivity
    const modifiers: Modifier[] = []

    // create foreign ids modifiers
    for (const [fieldName, entry] of Object.entries(collectionEntry.foreignIdFields)) {
        const paramsName = paramsNameFor(entry.collection, false)

        // as any because there is no way to index 
        // params (const record) with dynamic string
        if ((params as any)[paramsName] !== true) {
            continue
        }

        modifiers.push(createIdFieldModifier(
            collectionCache,
            collectionName,
            fieldName,
            entry.collection,
            triggerUpdate
        ))
    }

    // create foreign id listes modifiers
    for (const [fieldName, entry] of Object.entries(collectionEntry.foreignIdListFields)) {
        const paramsName = paramsNameFor(entry.collection, true)

        // as any because there is no way to index 
        // params (const record) with dynamic string
        if ((params as any)[paramsName] !== true) {
            continue
        }

        modifiers.push(createIdsFieldMofifier(
            collectionCache,
            collectionName,
            fieldName,
            entry.collection,
            triggerUpdate
        ))
    }

    const onObjectChange = async () => {
        const object = structuredClone(objectRef.value)
        if (!object) {
            resultRef.value = new CacheError(collectionName, "object has been set to null")
            return
        }

        try {
            
            await Promise.all(modifiers.map(async (modif) => {
                const error = await modif(object)
                if (error) { throw error }
            }))

        }catch(err) {
            resultRef.value = err
            return
        }

        resultRef.value = object
        return
    }

    watchEffect(onObjectChange)

    return resultRef
}
