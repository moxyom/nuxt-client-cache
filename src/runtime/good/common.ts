type Overwrite<T, U> = Omit<T, keyof U> & U;

// Ce type transforme le schéma original en schéma "étendu" selon les paramètres 'with'
type MapRelations<Schema, Foreign, Params> = Overwrite<Schema, {
    [K in keyof Foreign as `with${Capitalize<K & string>}` extends keyof Params
        ? (Params[`with${Capitalize<K & string>}` & keyof Params] extends false ? never : K)
        : never
    ]: Foreign[K] extends { collection: Collection<infer FSchema, infer FForein, any, any>, isList: infer IsList }
        ? `with${Capitalize<K & string>}` extends keyof Params
            ? (Overwrite<FSchema, MapRelations<FSchema, FForein, Params[`with${Capitalize<K & string>}`] extends true
                    ? object
                    : Params[`with${Capitalize<K & string>}`]>>) extends infer Result
                ? IsList extends true ? Result[] : Result
                : never
            : never
        : never
}>;
