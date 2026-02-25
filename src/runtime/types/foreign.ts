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

// Empêche la récursion infinie en limitant la profondeur (optionnel mais sécurisant)
type Prev = [never, 0, 1, 2, 3, 4, 5];

export type FilterForeignParams<Params, Foreign, Depth extends number = 6> = [Depth] extends [never]
  ? {}
  : {
    // On ne boucle que sur les clés présentes dans Params ET Foreign
    [K in keyof Foreign as `with${Capitalize<K & string>}` extends keyof Params ? K : never]:
        Foreign[K] extends { schema: infer FS, foreign: infer FF, isList: infer FL }
        ? (
            // Récupération des sous-paramètres (ex: withPosts: { withComments: true })
            Params[`with${Capitalize<K & string>}` & keyof Params] extends infer SubParams
            ? (
                // Si SubParams est 'true', on passe un objet vide pour ne pas planter la récursion
                (Overwrite<FS, FilterForeignParams<SubParams extends true ? {} : SubParams, FF, Prev[Depth]>>) extends infer Result
                ? FL extends true ? Result[] : Result
                : never
            )
            : never
        )
        : never
};

export type ForeignToParams<Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}`]?: boolean | RecursiveSelector<Foreign[K]>
};

type RecursiveSelector<F> = F extends { foreign: infer FF }
    ? ForeignToParams<FF>
    : never;
