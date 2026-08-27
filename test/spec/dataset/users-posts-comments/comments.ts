import { defineCollection } from "~/src/runtime/builder"
import { vi } from "vitest"
import type { Post } from "./posts"

export interface Comment {
    customId: string
    writerSlug: string
    title: string
    content: string
}

const comments: Comment[] = [
    {
        customId: "comment_001",
        writerSlug: "benjamin-lee",
        title: "Very helpful",
        content:
            "This was exactly what I needed to get started with TypeScript.",
    },
    {
        customId: "comment_002",
        writerSlug: "charlotte-smith",
        title: "Great introduction",
        content:
            "I especially liked the part about organizing the project structure.",
    },
    {
        customId: "comment_003",
        writerSlug: "alice-martin",
        title: "I can relate",
        content:
            "Working remotely definitely taught me how important a good routine is.",
    },
    {
        customId: "comment_004",
        writerSlug: "daniel-wilson",
        title: "Nice tips",
        content:
            "The advice about learning to use natural light is really useful.",
    },
    {
        customId: "comment_005",
        writerSlug: "emma-johnson",
        title: "Loved this",
        content:
            "I have been thinking about getting a camera, and this gave me a good starting point.",
    },
    {
        customId: "comment_006",
        writerSlug: "felix-brown",
        title: "Absolutely agree",
        content:
            "Reading before bed has become one of my favorite daily habits too.",
    },
    {
        customId: "comment_007",
        writerSlug: "grace-davis",
        title: "Saving these recipes",
        content:
            "These look simple enough for a busy week. I will definitely try a few of them.",
    },
    {
        customId: "comment_008",
        writerSlug: "henry-miller",
        title: "Perfect for beginners",
        content:
            "I am not much of a cook, but these recipes seem easy to follow.",
    },
    {
        customId: "comment_009",
        writerSlug: "isabella-moore",
        title: "Great motivation",
        content:
            "I just started running, so the beginner tips came at the perfect time.",
    },
    {
        customId: "comment_010",
        writerSlug: "jack-taylor",
        title: "Good advice",
        content:
            "Small changes really do make a difference when it comes to sustainability.",
    },
]

const findCommentById = vi.fn(async (query: { id: string }) => {
    const comment = comments.find((c) => c.customId == query.id)
    return comment ? { record: comment } : null
})

const commentsWherePost = vi.fn(async (params: { post: Post }) => {
    return { ids: params.post.commentIds }
})

const commentsWhereWriter = vi.fn(
    async (start: number, end: number, params: { slug: string }) => {
        const allComment = comments.filter((c) => c.writerSlug == params.slug)
        return { ids: allComment.slice(start, end).map((c) => c.customId) }
    },
)

export const commentCollection = defineCollection<Comment>(
    "comment",
    findCommentById,
)
    .withIdField("customId")
    .withScope("wherePost", {
        fetchAll: commentsWherePost,
        isIncluded: (c, params) => params.post.commentIds.includes(c.customId),
    })
    .withScope("whereWriter", {
        fetchRange: commentsWhereWriter,
        isIncluded: (c, params) => c.writerSlug == params.slug,
    })
    .build()

export const mocked = {
    findCommentById,
    commentsWherePost,
    commentsWhereWriter,
}
