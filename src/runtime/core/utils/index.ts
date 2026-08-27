import { InternalError } from "../../types/errors"
import type { CacheContext } from "../context"

/**
 * stringify with keys sorted, to compare serialization
 * @param obj the object to serialize
 * @returns a string representation of the object
 */
export const stableStringify = (obj: unknown): string => {
    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(",")}]`
    }

    const keys = Object.keys(obj).sort()
    return `{${keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((k) => `${JSON.stringify(k)}:${stableStringify((obj as any)[k])}`)
        .join(",")}}`
}

/**
 * parse stable stringify
 * @param str the representation to parse
 * @returns an object that which serialization would be the same as `str`
 * @throws `InternalError` if
 */
export const stableParse = (str: string) => {
    try {
        return JSON.parse(str)
    } catch {
        throw new InternalError(
            `unable to parse the stable representation of: ${str}`,
        )
    }
}

/**
 * check if the value is a promise
 * @param value the value to be checked
 * @returns boolean, true if the value is a promise
 */
export const isPromiseLike = <T>(
    value: T | PromiseLike<T>,
): value is PromiseLike<T> => {
    return (
        value !== null &&
        (typeof value === "object" || typeof value === "function") &&
        typeof (value as PromiseLike<T>).then === "function"
    )
}

/**
 * @param str the string to withify
 * @returns `str` withified
 */
export const withify = (str: string) => {
    const strCapitalize = str.slice(0, 1).toUpperCase() + str.slice(1)
    return `with${strCapitalize}`
}

/**
 * split params to search params and extras
 * @param ctx the current cache context
 * @param collectionName the name of the collection
 * @param params the params
 * @returns an object containing both searchParams and extras
 */
export const paramsToSearchParamsAndExtras = (
    ctx: CacheContext,
    collectionName: string,
    params: Record<string, unknown>,
) => {
    const { collectionStore } = ctx.getCollectionStore(collectionName)

    // create extra object, corresponding to virtuals
    // fields that will be needed to call search method
    const extras: Record<string, unknown> = {}
    for (const vFieldName of Object.keys(collectionStore.vFields)) {
        const withifyKey = withify(vFieldName)
        if (withifyKey in params) {
            extras[withifyKey] = params[withifyKey]
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete params[withifyKey]
        }
    }

    return { searchParams: params, extras }
}
