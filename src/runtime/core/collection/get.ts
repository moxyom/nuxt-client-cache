import { shallowRef, triggerRef, unref, watchEffect, type ShallowRef } from "vue";
import { CacheError } from "../../types/errors";
import type { Modifier } from "../modifiers";
import type { ReturnTypeFor, SearchParams } from "~/src/runtime/types";
import type { CacheCollectionEntry, CacheForeignEntry } from "~/src/runtime/types/inner";
import { idFor } from "../search";
import { store } from "./store";
import { createItemFieldModifier } from "../modifiers/field";
import { createItemListFieldMofifier } from "../modifiers/list-field";
import { getCache } from "../utils";

export async function get<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign,
    IdField extends string,
    const Params extends SearchParams<Search, Foreign, IdField>
>(
    collectionName: string,
    params: Params
): Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params> | CacheError>> {

    const collectionCache = getCache()

    // get collection
    const collectionEntry = collectionCache[collectionName] as CacheCollectionEntry<Schema> | undefined
    if (!collectionEntry) {
        return shallowRef(new CacheError(
            collectionName,
            "No collection found for " + collectionName
        ))
    }

    // parse search by if present
    const id = await getIdFrom<Schema, Search, Foreign, IdField, Params>(
        collectionEntry,
        params
    )

    // getIdFrom can return CacheError
    if (id instanceof CacheError) {
        return shallowRef(id)
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

        // store fetched resource,
        // validation is made in store
        const error = store(collectionEntry, fetchedObject)
        if (error) {
            return shallowRef(error)
        }

        objectRef = shallowRef(unref(fetchedObject))
    }

    // create ref that will be return
    const resultRef: ShallowRef<Schema | CacheError> = shallowRef(
        new CacheError("internal", "not yet initialize")
    )

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
    const modifiers: Modifier<Schema>[] = []

    // create foreign modifiers
    for (const [fieldName, entry] of Object.entries(collectionEntry.foreignFields)) {
        const paramsName = withify(fieldName)
        
        const foreignParams = (params as Record<string, unknown>)[paramsName]
        if (foreignParams === undefined || foreignParams == false) {
            continue
        }

        const baseParams = typeof foreignParams == "object"
            ? foreignParams as object
            : {} 

        const createModifierFn = entry.isList
            ? createItemListFieldMofifier
            : createItemFieldModifier

        modifiers.push(
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            createModifierFn<Schema, string, Record<string, unknown>, string, unknown, {}, {}>(
                collectionName,
                fieldName,
                entry.collection(),
                triggerUpdate,
                createTransformFor(entry, baseParams, fieldName)
            )
        )
    }

    const onObjectChange = async () => {
        const object = structuredClone(objectRef.value)
        if (!object) {
            resultRef.value = new CacheError(collectionName, "object has been set to null")
            return
        }

        await Promise.all(modifiers.map((modif) => modif(object)))

        resultRef.value = object
        return
    }

    watchEffect(onObjectChange)

    // cast because the actual object has been modified
    return resultRef as ShallowRef<ReturnTypeFor<Schema, Foreign, Params> | CacheError>
}

const getIdFrom = async<
    Schema,
    Search, 
    Foreign,
    IdField extends string,
    const Params extends SearchParams<Search, Foreign, IdField>
>(
    collectionEntry: CacheCollectionEntry<Schema>,
    params: Params
) => {
    
    if ("searchBy" in params) {
        // retrive id from params's search 
        const idRess = await idFor<Schema>(
            params.searchBy as string,
            params,
            collectionEntry
        )

        if (idRess instanceof CacheError) {
            return idRess
        }

        return idRess
    }

    const idFieldName = collectionEntry.idField
    if (!(idFieldName in params)) {
        throw new CacheError(
            "self",
            `no ${idFieldName} field in params`
        )
    }

    const id = (params as Record<string, unknown>)[idFieldName]
    if (typeof id != "string") { 
        throw new CacheError(
            "self",
            `${idFieldName} field in params must be a string (${id})`
        )
    }

    return id
    
}

const withify = (s: string) => `with${s[0]?.toUpperCase() + s.slice(1)}`

const createTransformFor = <Schema extends Record<string, unknown>>(
    entry: CacheForeignEntry<Schema, unknown>,
    baseParams: object,
    fieldName: string
) => {
    return (o: Schema) => {
        // create a params for the get function
        return Object.assign(
            // deep foreign
            structuredClone(baseParams),
            // search by id or by custom search
            entry.searchBy == undefined
                ? { [entry.collection()]: o[fieldName] }
                : entry.searchBy.transform(o)
        )
    }
}
