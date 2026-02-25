import type { Overwrite } from ".";

// --- Builder ---
type SearchByParams<
    Schema,
    ForeignSearchParams extends Record<string, any>,
    IsList
> = {
    [K in keyof ForeignSearchParams]: K | {
        name: K,
        transform: IsList extends true
        ? (obj: Schema, index: number) => ForeignSearchParams[K]
        : (obj: Schema) => ForeignSearchParams[K]
    }
}[keyof ForeignSearchParams];

export interface WithForeignParams<
    Schema,
    ForeignSearchParams extends Record<string, any>,
    IsList,
> {
    list?: boolean,
    searchBy?: SearchByParams<Schema, ForeignSearchParams, IsList>
}

export type MakeForeign<Field extends string, Params, ForeignSchema, ForeignForeign> = {
    [K in Field]: {
        schema: ForeignSchema
        foreign: ForeignForeign
        isList: Params extends { list: true } ? true : false
    }
}

// --- Runtime ---

export type ForeignToParams<Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}`]?: boolean | RecursiveSelector<Foreign[K]>
}

type RecursiveSelector<F> = F extends { foreign: infer F }
    ? ForeignToParams<F>
    : never

export type FilterForeignParams<Params, Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}` extends keyof Params
    ? (Params[`with${Capitalize<K & string>}`] extends true | Record<string, any> ? K : never)
    : never
    ]: (
        Foreign[K] extends { schema: infer FS, foreign: infer FF, isList: infer FL }
        ? (`with${Capitalize<K & string>}` extends keyof Params
            ? (
                (Overwrite<FS, FilterForeignParams<Params[`with${Capitalize<K & string>}`] extends true
                    ? {}
                    : Params[`with${Capitalize<K & string>}`], FF>>) extends infer Result
                ? FL extends true ? Result[] : Result
                : never)
            : never)
        : never
    )
}

export type FilterForeignParamsOld<Params, Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}` extends infer ParamName
    ? (ParamName extends keyof Params
        ? Params[ParamName] extends true | Record<string, any> ? K : never
        : never)
    : never
    ]: (
        Foreign[K] extends { schema: infer FS, foreign: infer FF, isList: infer FL }
        ? (`with${Capitalize<K & string>}` extends keyof Params
            ? (
                (Overwrite<FS, FilterForeignParams<Params[`with${Capitalize<K & string>}`] extends true
                    ? {}
                    : Params[`with${Capitalize<K & string>}`], FF>>) extends infer Result
                ? FL extends true ? Result[] : Result
                : never)
            : never)
        : never
    )
}

// export type FilterForeignParams<Params, Foreign> = {
//     [K in keyof Foreign as `with${Capitalize<K & string>}` extends infer ParamName
//     ? (ParamName extends keyof Params
//         ? Params[ParamName] extends true | Record<string, any> ? K : never
//         : never)
//     : never
//     ]: (
//         Foreign[K] extends { schema: infer FS, foreign: infer FF, isList: infer FL }
//         ? (FL extends true
//             ? (FS & FilterForeignParams<Params[ParamName], FF>)[]
//             : FilterForeignParams<Params[ParamName], FF>)
//         : never
//     )
// }

type TEST<Params, Foreign> =
    {
        [K in keyof Foreign as `with${Capitalize<K & string>}` extends infer ParamName
        ? (ParamName extends keyof Params
            ? Params[ParamName] extends true ? K : never
            : never)
        : never
        ]: Foreign[K]
    }
