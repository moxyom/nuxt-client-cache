import { shallowRef, triggerRef, unref, watchEffect, type ShallowRef } from "vue"
import { CacheError } from "../../types/errors"
import type { Modifier } from "../modifiers"
import type { ReturnTypeFor, SearchParams } from "~/src/runtime/types"
import { idFor } from "../search"
import { store } from "./store"
import { createItemFieldModifier } from "../modifiers/field"
import { createItemListFieldMofifier } from "../modifiers/list-field"
import type { CacheCollectionStore, CacheForeignStore } from "../../types/inner"

export async function get<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign,
    IdField extends string,
    const Params extends SearchParams<Search, Foreign, IdField>
>(
    cache: Record<string, CacheCollectionStore<unknown>>,
    collectionName: string,
    params: Params
): Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params> | CacheError>> {

    // don't try to get collection cache 
    // with getCache function, like in deep  
    // async function contexte can be lost
    const collectionStore = cache[collectionName] as CacheCollectionStore<Schema> | undefined
    if (!collectionStore) {
        throw new Error("No mox cache collection named " + collectionName)
    }
    
    // parse search by if present
    const id = await getIdFrom<Schema, Search, Foreign, IdField, Params>(
        collectionStore,
        params
    )

    // getIdFrom can return CacheError
    if (id instanceof CacheError) {
        return shallowRef(id)
    }

    const stored = collectionStore.index.get(id)
    let objectRef = stored ? stored : shallowRef(null)

    // try get the object from the store
    if (!objectRef.value) {

        // fetch the object
        const fetchedObject: Schema | null = await collectionStore.fetch(id)
        if (!fetchedObject) {
            return shallowRef(new CacheError(
                collectionName,
                "unable to fetch resource"
            ))
        }

        // store fetched resource, validation
        // is made in store function
        const error = store(collectionStore, fetchedObject)
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
    for (const [fieldName, foreign] of Object.entries(collectionStore.foreigns)) {
        const paramsName = withify(fieldName)
        
        const foreignParams = (params as Record<string, unknown>)[paramsName]
        if (foreignParams === undefined || foreignParams == false) {
            continue
        }

        const baseParams = typeof foreignParams == "object"
            ? foreignParams as object
            : {} 

        const createModifierFn = foreign.isList
            ? createItemListFieldMofifier
            : createItemFieldModifier

        const foreignIdField = cache[foreign.collection()]?.idField
        if (!foreignIdField) {
            throw new Error(
                "No collection found for " + foreign.collection()
            )
        }

        modifiers.push(
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            createModifierFn<Schema, string, Record<string, unknown>, string, unknown, {}, {}>(
                cache,
                collectionName,
                fieldName,
                foreign.collection(),
                triggerUpdate,
                createTransformFor(foreign, baseParams, fieldName, foreignIdField),
            )
        )
    }

    // create a promise to wait for first 
    // object modif to be finished
    let resolveFirstRun: () => void
    const firstRunPromise = new Promise((r) => {
        resolveFirstRun = r as () => void
    })

    const onObjectChange = async () => {
        const object = structuredClone(objectRef.value)
        if (!object) {
            resultRef.value = new CacheError(collectionName, "object has been set to null")
            resolveFirstRun()
            return
        }

        await Promise.all(modifiers.map((modif) => modif(object)))
        resultRef.value = object

        resolveFirstRun()
        return
    }

    watchEffect(onObjectChange)

    // wait for the first run of 
    // modif to be effectif
    await firstRunPromise

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
    collectionStore: CacheCollectionStore<Schema>,
    params: Params
) => {
    
    if ("searchBy" in params) {
        // retrive id from params's search 
        const idRess = await idFor<Schema>(
            collectionStore,
            params.searchBy as string,
            params,
        )

        if (idRess instanceof CacheError) {
            return idRess
        }

        return idRess
    }

    const idFieldName = collectionStore.idField
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
    entry: CacheForeignStore<Schema, unknown>,
    baseParams: object,
    fieldName: string,
    foreignIdField: string,
) => {
    return (o: Schema, index?: number) => {

        // create a params for the get function
        return Object.assign(
            // deep foreign
            structuredClone(baseParams),
            // search by id or by custom search
            entry.searchBy == undefined
            ? index == undefined
                ? { [foreignIdField]: o[fieldName] }
                : { [foreignIdField]: (o[fieldName] as unknown[])[index] }
            : entry.searchBy.transform(o)
        )
    }
}
