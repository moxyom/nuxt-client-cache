/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Reactive, Ref } from "vue"
import type { CacheError } from "./errors"

export interface EditableFunctions<ErrorType> {
    valid(): Ref<boolean>
    errors(): Ref<ErrorType | null>
    commit(): Promise<void>
}

export interface ObjectFunctions<Schema, ValidationError> {
    reload(): Promise<true | CacheError>
    createEditadble(): Reactive<Schema & EditableFunctions<ValidationError>>
}

export interface ScopeFunctions {
    status(): Ref<"incomplete" | "loading" | "complete" | "not-found">
    fetchNext(n: number): Promise<void>
}

export interface VFieldEntry<FSchema, FVFields, FValidationError, IsScope> {
    fSchema: FSchema
    fVFields: FVFields
    fValidationError: FValidationError
    isScope: IsScope
}

type Overwrite<T, U> = Omit<T, keyof U> & U

// transform with query to actual response
export type ReturnTypeFor<
    Schema,
    VFields,
    Params,
    ValidationError,
    Depth extends any[] = [],
> = Depth["length"] extends 6
    ? Schema & ObjectFunctions<Schema, ValidationError> // limit to 6 recurtion
    : Overwrite<
          Schema & ObjectFunctions<Schema, ValidationError>,
          {
              [
                  VFName in keyof VFields as `with${Capitalize<VFName & string>}` extends keyof Params
                      ? Params[`with${Capitalize<VFName & string>}` &
                            keyof Params] extends false
                          ? never
                          : VFName
                      : never // only keep VFields keys that are in Params (withified)
              ]: VFields[VFName] extends VFieldEntry<
                  infer FSchema,
                  infer FVFields,
                  infer FValidationError,
                  infer IsScope
              >
                  ? `with${Capitalize<VFName & string>}` extends keyof Params // for TS safety
                      ? (
                            Params[`with${Capitalize<VFName & string>}` &
                                keyof Params] extends true
                                ? // if only true, foreing with functions
                                  FSchema &
                                      ObjectFunctions<FSchema, FValidationError>
                                : // otherwise schema recurcivlty in ReturnTypeFor
                                  ReturnTypeFor<
                                      FSchema,
                                      FVFields,
                                      Params[`with${Capitalize<VFName & string>}`],
                                      FValidationError,
                                      [...Depth, any]
                                  >
                        ) extends infer Result
                          ? IsScope extends true
                              ? Result[] & ScopeFunctions
                              : Result
                          : never
                      : never
                  : never
          }
      >

export type ParamsFor<VFields> = {
    [K in keyof VFields as `with${Capitalize<K & string>}`]?:
        | boolean
        | (VFields[K] extends VFieldEntry<any, infer FVFields, any, any>
              ? ParamsFor<FVFields>
              : VFields[K])
}

export type SearchParams<Searches, VFields, IdField extends string> = (
    | { [k in IdField]: string }
    | { [K in keyof Searches]: { searchBy: K } & Searches[K] }[keyof Searches]
) &
    ParamsFor<VFields>

export type SearchFunction<
    Schema,
    Searches,
    VFields,
    IdField extends string,
    ValidationError,
> = <const Params extends SearchParams<Searches, VFields, IdField>>(
    p: Params,
) => Promise<
    Ref<ReturnTypeFor<Schema, VFields, Params, ValidationError> | CacheError>
>

export type ScopeAccessEntry<ScopeParams, Schema, VFields, ValidationError> = <
    Params extends ScopeParams & ParamsFor<VFields>,
>(
    p: Params,
) => Promise<
    Ref<
        | (ReturnTypeFor<Schema, VFields, Params, ValidationError>[] &
              ScopeFunctions)
        | CacheError
    >
>

export type Collection<
    Schema,
    Searches,
    VFields,
    Scopes,
    IdField extends string,
    CustomMethodes,
    ValidationError,
> = {
    search: SearchFunction<Schema, Searches, VFields, IdField, ValidationError>
    store(object: Schema): CacheError | undefined
    unstore(id: string): Error | undefined
    createEditable(
        defaultObject: Schema,
    ): Reactive<Schema & EditableFunctions<ValidationError>>
} & {
    [K in keyof Scopes]: ScopeAccessEntry<
        Scopes[K],
        Schema,
        VFields,
        ValidationError
    >
} & CustomMethodes
