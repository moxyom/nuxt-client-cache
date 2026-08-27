import { findPostById, whereWriter, type Post } from "~/shared/post-factory"

export const postCollection = defineCollection<Post>("post", findPostById)
    .withScope("whereWriter", {
        isIncluded: (record, params) => record.writer == params.writerId,
        fetchAll: whereWriter,
    })
    .withVirtualField("comments", {
        from: commentCollection,
        scope: "wherePost",
        with: (p) => ({ postSlug: p.slug }),
    })
    .build()
