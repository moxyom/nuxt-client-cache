import { shallowRef, type ShallowRef } from "vue"
import {
    CacheError,
    InternalError,
    UnexpectedReturnTypeError,
    type ProvidedFunction,
} from "../../types/errors"
import { isPromiseLike } from "."
import type { CacheContext } from "../context"

export interface ErrorMultiplexer {
    errorRef: ShallowRef<CacheError | null>
    register: (e: CacheError) => void
    unregister: (e: CacheError) => void
}

export const anyToCacheError = (e: unknown) => {
    return e instanceof CacheError ? e : new InternalError(`${e}`)
}

/**
 * use to create an error multiplexer object, which is
 * convenient way of storing multiple errors and having
 * one ref that represent the **most important** one from the list
 * @returns an ErrorMultiplexer object
 */
export const createErrorMultiplexer = (): ErrorMultiplexer => {
    const errorRef = shallowRef<CacheError | null>(null)
    const errors: CacheError[] = []

    const updateErrorRef = () => {
        errorRef.value = errors.length > 0 ? errors[0]! : null
    }

    return {
        errorRef,
        register(newError: CacheError) {
            // insert newError at an index that keep the array sorted
            errors.splice(
                errors.findIndex((error) =>
                    CacheError.compare(error, newError),
                ),
                0,
                newError,
            )

            updateErrorRef()
        },
        unregister(error: CacheError) {
            const errorIndex = errors.indexOf(error)
            if (errorIndex != -1) errors.splice(errorIndex, 1)

            updateErrorRef()
        },
    }
}

/**
 * execute a function with UnexpectedReturnTypeError  
 * error handling.
 * @param ctx the cache context to be able to run with context
 * @param collectionName the collection name
 * @param providedFunction the name of the provided function
 * @param fn a async wrapper to execute the function
 * @returns what the provided funtion return
 */
export function safeExecuteProvidedFunction<T>(
    ctx: CacheContext,
    collectionName: string,
    providedFunction: ProvidedFunction,
    fn: () => T,
): T

/**
 * execute a function with UnexpectedReturnTypeError  
 * error handling.
 * @param ctx the cache context to be able to run with context
 * @param collectionName the collection name
 * @param providedFunction the name of the provided function
 * @param fn a sync wrapper to execute the function
 * @returns what the provided funtion return
 */
export function safeExecuteProvidedFunction<T>(
    ctx: CacheContext,
    collectionName: string,
    providedFunction: ProvidedFunction,
    fn: () => Promise<T>,
): Promise<T>

export function safeExecuteProvidedFunction<T>(
    ctx: CacheContext,
    collectionName: string,
    providedFunction: ProvidedFunction,
    fn: () => T | Promise<T>,
) {
    const throwError = (error: unknown): never => {
        throw new UnexpectedReturnTypeError(
            collectionName,
            providedFunction,
            "threw unexpectedly : " + error,
        )
    }

    try {
        const result = ctx.runWithContext(fn)
        return isPromiseLike(result) ? result.catch(throwError) : result
    } catch (e) {
        return throwError(e)
    }
}
