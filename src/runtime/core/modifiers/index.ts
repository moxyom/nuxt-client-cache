import type { CacheError } from "../../types/errors";

export type Modifier = (object: any) => Promise<CacheError | void>
