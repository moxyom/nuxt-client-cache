import { defineCollection } from "~/src/runtime/builder"
import { vi } from "vitest"
import { commentCollection } from "./comments"

export interface Post {
    id: string
    writerId: string
    title: string
    tags: string[]
    img: { alt: string; filename: string }
    commentIds: string[]
}

const posts: Post[] = [
    {
        id: "post_001",
        writerId: "usr_001",
        title: "How I Built My First TypeScript Project",
        tags: ["typescript", "programming", "tutorial"],
        img: {
            alt: "Laptop showing TypeScript code",
            filename: "typescript-project.jpg",
        },
        commentIds: ["comment_001", "comment_002"],
    },
    {
        id: "post_002",
        writerId: "usr_002",
        title: "Five Lessons I Learned From Remote Work",
        tags: ["remote-work", "productivity", "career"],
        img: {
            alt: "Person working remotely at a desk",
            filename: "remote-work.jpg",
        },
        commentIds: ["comment_003"],
    },
    {
        id: "post_003",
        writerId: "usr_003",
        title: "A Beginner's Guide to Digital Photography",
        tags: ["photography", "beginners", "creative"],
        img: {
            alt: "Camera on a wooden table",
            filename: "digital-photography.jpg",
        },
        commentIds: ["comment_004", "comment_005"],
    },
    {
        id: "post_004",
        writerId: "usr_004",
        title: "Why Reading Every Day Changed My Life",
        tags: ["books", "habits", "self-improvement"],
        img: {
            alt: "Open book next to a cup of coffee",
            filename: "daily-reading.jpg",
        },
        commentIds: ["comment_006"],
    },
    {
        id: "post_005",
        writerId: "usr_005",
        title: "My Favorite Recipes for Busy Weeknights",
        tags: ["cooking", "recipes", "food"],
        img: {
            alt: "Healthy homemade dinner on a table",
            filename: "weeknight-recipes.jpg",
        },
        commentIds: ["comment_007", "comment_008"],
    },
    {
        id: "post_006",
        writerId: "usr_006",
        title: "Getting Started With Running",
        tags: ["running", "fitness", "health"],
        img: {
            alt: "Runner on a city path",
            filename: "getting-started-running.jpg",
        },
        commentIds: ["comment_009"],
    },
    {
        id: "post_007",
        writerId: "usr_007",
        title: "Simple Ways to Make Your Home More Sustainable",
        tags: ["sustainability", "home", "environment"],
        img: {
            alt: "Plants and reusable items in a bright home",
            filename: "sustainable-home.jpg",
        },
        commentIds: ["comment_010"],
    },
    {
        id: "post_008",
        writerId: "usr_008",
        title: "Understanding APIs Without the Jargon",
        tags: ["api", "web-development", "programming"],
        img: {
            alt: "Developer working on an API project",
            filename: "understanding-apis.jpg",
        },
        commentIds: ["comment_001", "comment_003"],
    },
    {
        id: "post_009",
        writerId: "usr_009",
        title: "The Best Places to Visit in Spring",
        tags: ["travel", "spring", "destinations"],
        img: {
            alt: "Colorful European street in spring",
            filename: "spring-travel.jpg",
        },
        commentIds: ["comment_004", "comment_007"],
    },
    {
        id: "post_010",
        writerId: "usr_010",
        title: "What I Wish I Knew Before Starting My Business",
        tags: ["business", "entrepreneurship", "career"],
        img: {
            alt: "Notebook and laptop on a business desk",
            filename: "starting-a-business.jpg",
        },
        commentIds: ["comment_005", "comment_006", "comment_010"],
    },
]

const findPostById = vi.fn(async (query: { id: string }) => {
    const post = posts.find((p) => p.id == query.id)
    return post ? { record: post } : null
})

const postsWhereUser = vi.fn(async (query: { id: string }) => {
    const allPosts = posts.filter((p) => p.writerId == query.id)
    return { ids: allPosts.map((c) => c.id) }
})

export const postCollection = defineCollection<Post>("post", findPostById)
    .withScope("whereWriter", {
        fetchAll: postsWhereUser,
        isIncluded: (p, params) => p.writerId == params.id,
    })
    .withVirtualField("comments", {
        from: commentCollection,
        scope: "wherePost",
        with: (post) => ({ post }),
    })
    .build()

export const mocked = {
    findPostById,
    postsWhereUser,
}
