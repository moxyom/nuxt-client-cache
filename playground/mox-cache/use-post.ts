import { findPostById, type Post } from "~/shared/post-factory";
import { shallowCollectionFor } from "../../src/runtime/types";
import type { User } from "~/shared/user-factory";

export const postCollection = defineMoxCacheCollection<Post>("post", findPostById)
    .withForeign("comments", { collection: () => commentCollection, list: true })
    .withShallowForeign("writer", { collection: shallowCollectionFor<User>("user") })
    .build()
