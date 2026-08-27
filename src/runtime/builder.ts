/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */

import { createCollection } from "./core"
import { registerDefinition } from "./definitions"
import type { Collection } from "./types/collection"
import type {
    CacheCollectionDefinition,
    ProvidesRecord,
} from "./types/definitions"
import { ConfigurationError } from "./types/errors"

class CollectionBuilder<
    Schema extends Record<string, unknown>,
    Searches = {},
    VFields = {},
    Scopes = {},
    IdField extends string = "id",
    CustomMethodes = {},
    ValidationError = never,
> {
    private definition: CacheCollectionDefinition<Schema>
    private collectionName: string

    constructor(
        name: string,
        fetch: (query: { id: string } & object) => Promise<{
            record: Schema
            provides?: ProvidesRecord
        } | null>,
    ) {
        this.collectionName = name
        this.definition = {
            fetch,
            validationFunction: () => null,
            idField: "id",
            customFunctions: {},
            searches: {},
            vFields: {},
            scopes: {},
        }
    }

    withIdField<NewIdField extends keyof Schema & string>(idField: NewIdField) {
        this.definition.idField = idField
        return this as CollectionBuilder<
            Schema,
            Searches,
            VFields,
            Scopes,
            NewIdField,
            CustomMethodes,
            ValidationError
        >
    }

    validateWith<NewValidationError>(
        validationFunction: (o: Schema) => NewValidationError | null,
    ) {
        this.definition.validationFunction = validationFunction as any
        return this as CollectionBuilder<
            Schema,
            Searches,
            VFields,
            Scopes,
            IdField,
            CustomMethodes,
            NewValidationError
        >
    }

    withSearch<const Name extends string, const Params>(
        name: Name,
        search: (
            query: Params,
            extra: object,
        ) => Promise<{
            record: Schema
            provides?: Record<string, object[]>
        } | null>,
        toParams: Name extends keyof Schema
            ? Params extends Pick<Schema, Name>
                ? undefined | ((o: Schema) => Params | null)
                : (o: Schema) => Params | null
            : (o: Schema) => Params | null,
    ) {
        this.definition.searches[name] = {
            search,
            toParams:
                toParams == undefined ? (o) => ({ [name]: o[name] }) : toParams,
        }

        return this as CollectionBuilder<
            Schema,
            Searches & { [k in Name]: Params },
            VFields,
            Scopes,
            IdField,
            CustomMethodes,
            ValidationError
        >
    }

    withVirtualField<
        const Name extends string,
        const FSchema,
        const FSearches,
        const FVFields extends Record<string, any>,
        const FScopes,
        const FValidationError,
        const Nulable extends boolean,
    >(
        name: Name,
        opt: {
            from: Collection<
                FSchema,
                FSearches,
                FVFields,
                FScopes,
                string,
                unknown,
                FValidationError
            >
            nullable: Nulable
        } & (
            | {
                  [K in keyof FSearches]: {
                      searchBy: K & string
                      with: (o: Schema) => FSearches[K]
                  }
              }[keyof FSearches]
            | { foreign: (o: Schema) => string }
        ),
    ): CollectionBuilder<
        Schema,
        Searches,
        VFields & {
            [k in Name]: {
                fSchema: FSchema
                fVFields: FVFields
                fValidationError: FValidationError
                isScope: false
                nullable: Nulable
            }
        },
        Scopes,
        IdField,
        CustomMethodes,
        ValidationError
    >

    withVirtualField<
        const Name extends string,
        const FSchema,
        const FSearches,
        const FVFields,
        const FScopes,
        const FValidationError,
    >(
        name: Name,
        opt: {
            from: Collection<
                FSchema,
                FSearches,
                FVFields,
                FScopes,
                string,
                unknown,
                FValidationError
            >
        } & {
            [S in keyof FScopes]: {
                scope: S & string
                with: (o: Schema) => FScopes[S]
            }
        }[keyof FScopes],
    ): CollectionBuilder<
        Schema,
        Searches,
        VFields & {
            [k in Name]: {
                fSchema: FSchema
                fVFields: FVFields
                fValidationError: FValidationError
                isScope: true
                nullable: false
            }
        },
        Scopes,
        IdField,
        CustomMethodes,
        ValidationError
    >

    withVirtualField<
        const Name extends string,
        const FSchema,
        const FSearches,
        const FVFields,
        const FScopes,
        const IsScope,
        const FValidationError,
        const Nulable extends boolean,
    >(
        name: Name,
        opt: {
            from:
                | Collection<
                      FSchema,
                      FSearches,
                      FVFields,
                      FScopes,
                      string,
                      any,
                      FValidationError
                  >
                | (() => Collection<
                      FSchema,
                      FSearches,
                      FVFields,
                      FScopes,
                      string,
                      unknown,
                      FValidationError
                  >)
        } & (IsScope extends true
            ? {
                  [S in keyof FScopes]: {
                      scope: S & string
                      with: (o: Schema) => FScopes[S]
                      nullable: Nulable
                  }
              }[keyof FScopes]
            : FSearches extends Record<string, any>
              ? | {
                      [K in keyof FSearches]: {
                          searchBy: K & string
                          with: (o: Schema) => FSearches[K]
                      }
                  }[keyof FSearches]
                | { foreign: (o: Schema) => string }
              : {}),
    ) {
        const fCollection =
            typeof opt.from == "function" ? opt.from() : opt.from

        // wrap foreign collection name access in a function to allow cyclic importation
        const collection = () => (fCollection as any)._name
        const nullable: boolean = "nullable" in opt ? opt.nullable : false

        let entry: {
            collection: () => string
            scope?: string
            toParams: (o: Schema) => object
            nullable: boolean
        }

        if ("scope" in opt) {
            entry = {
                collection,
                scope: opt.scope,
                toParams: opt.with as any,
                nullable,
            }
        } else if ("searchBy" in opt) {
            entry = {
                collection,
                toParams: (o) => ({ searchBy: opt.searchBy, ...opt.with(o) }),
                nullable,
            }
        } else if ("foreign" in opt) {
            const foreignCollectionIdField = (fCollection as any)
                ._idField as string

            entry = {
                collection,
                toParams: (o) => ({
                    [foreignCollectionIdField]: opt.foreign(o),
                }),
                nullable,
            }
        } else {
            throw new ConfigurationError(
                this.collectionName,
                `wrong configuration of virtualFields ${name}`,
            )
        }

        this.definition.vFields[name] = entry
        return this as CollectionBuilder<
            Schema,
            Searches,
            VFields & {
                [k in Name]: {
                    fSchema: FSchema
                    fVFields: FVFields
                    fValidationError: FValidationError
                    isScope: IsScope
                    nullable: Nulable
                }
            },
            Scopes,
            IdField,
            CustomMethodes,
            ValidationError
        >
    }

    withScope<const Name extends string, const ScopeParams>(
        name: Name,
        opt: (
            | {
                  fetchRange: (
                      start: number,
                      end: number,
                      params: ScopeParams,
                      extra: object,
                  ) => Promise<{
                      ids: string[]
                      provides?: ProvidesRecord
                  } | null>
              }
            | {
                  fetchAll: (
                      params: ScopeParams,
                      extra: object,
                  ) => Promise<{
                      ids: string[]
                      provides?: ProvidesRecord
                  } | null>
              }
        ) & {
            isIncluded: (object: Schema, params: ScopeParams) => boolean | null
        },
    ) {
        this.definition.scopes[name] = opt as any
        return this as CollectionBuilder<
            Schema,
            Searches,
            VFields,
            Scopes & { [k in Name]: ScopeParams },
            IdField,
            CustomMethodes,
            ValidationError
        >
    }

    build() {
        // register a collection definition that will be
        // transform to actual cache at each request
        registerDefinition(this.collectionName, this.definition)

        return createCollection<Schema>(
            this.collectionName,
            this.definition,
        ) as Collection<
            Schema,
            Searches,
            VFields,
            Scopes,
            IdField,
            CustomMethodes,
            ValidationError
        >
    }
}

export const defineCollection = <Schema extends Record<string, any>>(
    name: string,
    fetch: (query: { id: string } & object) => Promise<{
        record: Schema
        provides?: ProvidesRecord
    } | null>,
) => new CollectionBuilder(name, fetch)

export const shallowCollection = <Schema, IdField extends string = "id">(
    name: string,
    opt?: { idField: IdField },
): Collection<Schema, Record<string, unknown>, {}, {}, IdField, {}, never> => {
    return {
        _name: name,
        _idField: opt ? opt.idField : "id",
    } as any as Collection<
        Schema,
        Record<string, unknown>,
        {},
        {},
        IdField,
        {},
        never
    >
}
