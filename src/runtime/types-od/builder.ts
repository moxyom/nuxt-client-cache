import type { MakeForeign, WithForeignParams } from './foreign'
import type { Collection } from '.'
import type { MakeSubset, Subset, WithSubsetParams } from './subset'

export interface CollectionBuilder<
    Schema,
    SearchParams = never,
    Foreign = {},
    Subsets extends Subset = never,
> {

    withIdField(field: string): CollectionBuilder<Schema, SearchParams, Foreign, Subset>

    withCustomSearch<
        const SearchName extends string,
        CurrentSearchParams
    >(
        name: SearchName,
        searchFn: (params: CurrentSearchParams) => Promise<string | Schema | null>
    ): CollectionBuilder<Schema, SearchParams | { [K in SearchName]: CurrentSearchParams }, Foreign, Subsets>

    withForeign<
        const FieldName extends keyof Schema & string,
        FSchema,
        FSearchParams extends Record<string, any>,
        FForeign,
        const Params extends WithForeignParams<Schema, FSearchParams, IsList>,
        IsList = Params extends { list: true } ? true : false,
    >(
        field: FieldName,
        // Utilisation d'une interface générique ici pour briser la chaîne de récursion
        collection: Collection<FSchema, FSearchParams, FForeign, any> | (() => Collection<FSchema, FSearchParams, FForeign, any>),
        params?: Params
    ): CollectionBuilder<
        Schema,
        SearchParams,
        Foreign & MakeForeign<FieldName, Params, FSchema, FForeign>,
        Subsets
    >

    withSubset<
        const SubsetName extends string,
        const Params extends WithSubsetParams<Schema>
    >(
        name: SubsetName,
        params: Params
    ): CollectionBuilder<
        Schema,
        SearchParams,
        Foreign,
        Subsets | MakeSubset<SubsetName, Params>
    >

    build(): Collection<Schema, SearchParams | { id: string }, Foreign, Subsets>

}
