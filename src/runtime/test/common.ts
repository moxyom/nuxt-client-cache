import type { CollectionBuilder } from "../types";

export const defineCollection = {} as unknown as <Schema>(name: string) => CollectionBuilder<Schema>
