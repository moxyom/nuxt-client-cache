/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ParamsFor,
    ReturnTypeFor,
    ScopeFunctions,
    SearchFunction,
} from "./collection"

type UnwrapParamsForVField<Collection> = Collection extends {
    search: SearchFunction<any, infer _, infer VFields, infer _, any>
}
    ? ParamsFor<VFields>
    : never

export type RecordFor<
    Collection,
    Params extends UnwrapParamsForVField<Collection>,
> = Collection extends {
    search: SearchFunction<
        infer Schema,
        infer _,
        infer VFields,
        infer _,
        infer ValidationError
    >
}
    ? ReturnTypeFor<Schema, VFields, Params, ValidationError>
    : never

export type ScopeFor<
    Collection,
    Params extends UnwrapParamsForVField<Collection>,
> = RecordFor<Collection, Params> & ScopeFunctions
