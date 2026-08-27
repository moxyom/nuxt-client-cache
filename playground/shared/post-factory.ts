export interface Post {
    id: string
    slug: string
    writer: string
    title: string
    tags: string[]
    img: { alt: string; filename: string }
}

const posts: Post[] = [
    {
        id: "p1",
        slug: "post1",
        writer: "u1",
        title: "Introduction à TypeScript",
        tags: ["ts", "js"],
        img: { alt: "TS Logo", filename: "ts.png" },
    },
    {
        id: "p2",
        slug: "post2",
        writer: "u1",
        title: "Maîtriser Generics",
        tags: ["ts", "advanced"],
        img: { alt: "Code Abstract", filename: "code.jpg" },
    },
    {
        id: "p3",
        slug: "post3",
        writer: "u2",
        title: "Le futur de React",
        tags: ["react", "web"],
        img: { alt: "React atom", filename: "react.png" },
    },
    {
        id: "p4",
        slug: "post4",
        writer: "u3",
        title: "Architecture Microservices",
        tags: ["backend", "cloud"],
        img: { alt: "Server rack", filename: "cloud.png" },
    },
    {
        id: "p5",
        slug: "post5",
        writer: "u3",
        title: "Docker en production",
        tags: ["devops", "docker"],
        img: { alt: "Whale", filename: "docker.jpg" },
    },
    {
        id: "p6",
        slug: "post6",
        writer: "u4",
        title: "UI vs UX Design",
        tags: ["design", "ux"],
        img: { alt: "Interface mockup", filename: "design.png" },
    },
    {
        id: "p7",
        slug: "post7",
        writer: "u5",
        title: "Clean Code en JS",
        tags: ["js", "best-practices"],
        img: { alt: "Clean desk", filename: "clean.png" },
    },
    {
        id: "p8",
        slug: "post8",
        writer: "u5",
        title: "Refactoring Legacy",
        tags: ["js", "refactoring"],
        img: { alt: "Spaghetti code", filename: "legacy.png" },
    },
    {
        id: "p9",
        slug: "post9",
        writer: "u6",
        title: "Apprendre par la pratique",
        tags: ["learning"],
        img: { alt: "Student", filename: "learn.jpg" },
    },
    {
        id: "p10",
        slug: "post10",
        writer: "u7",
        title: "Next.js 15 Guide",
        tags: ["nextjs", "react"],
        img: { alt: "Next Logo", filename: "next.png" },
    },
    {
        id: "p11",
        slug: "post11",
        writer: "u7",
        title: "SSR vs SSG",
        tags: ["web", "perf"],
        img: { alt: "Performance graph", filename: "perf.png" },
    },
    {
        id: "p12",
        slug: "post12",
        writer: "u8",
        title: "CSS Grid Masterclass",
        tags: ["css", "design"],
        img: { alt: "Grid layout", filename: "grid.jpg" },
    },
    {
        id: "p13",
        slug: "post13",
        writer: "u9",
        title: "Pandas pour les nuls",
        tags: ["python", "data"],
        img: { alt: "Panda", filename: "pandas.png" },
    },
    {
        id: "p14",
        slug: "post14",
        writer: "u10",
        title: "Accessibilité Web",
        tags: ["a11y", "web"],
        img: { alt: "A11y icon", filename: "a11y.png" },
    },
    {
        id: "p15",
        slug: "post15",
        writer: "u10",
        title: "User Research 101",
        tags: ["ux", "research"],
        img: { alt: "Interviews", filename: "ux.jpg" },
    },
    {
        id: "p16",
        slug: "post16",
        writer: "u11",
        title: "AWS Lambda Secrets",
        tags: ["aws", "serverless"],
        img: { alt: "Lambda logo", filename: "aws.png" },
    },
    {
        id: "p17",
        slug: "post17",
        writer: "u12",
        title: "Java Stream API",
        tags: ["java", "backend"],
        img: { alt: "Coffee bean", filename: "java.png" },
    },
    {
        id: "p18",
        slug: "post18",
        writer: "u13",
        title: "Redux Toolkit",
        tags: ["react", "redux"],
        img: { alt: "State management", filename: "redux.png" },
    },
    {
        id: "p19",
        slug: "post19",
        writer: "u14",
        title: "Vue 3 Composition API",
        tags: ["vue", "js"],
        img: { alt: "Vue logo", filename: "vue.png" },
    },
    {
        id: "p20",
        slug: "post20",
        writer: "u15",
        title: "Node.js Streams",
        tags: ["node", "backend"],
        img: { alt: "Water stream", filename: "node.jpg" },
    },
]

export const findPostById = async (query: { id: string }) => {
    console.log("finding post by id : " + query.id)
    for (let k = 0; k < posts.length; k++) {
        const post = posts[k]!

        if (post.id == query.id) {
            return { record: post }
        }
    }

    return null
}

export const whereWriter = async (query: { writerId: string }) => {
    console.log("finding comment by writerId : " + query.writerId)
    return {
        ids: posts
            .filter((post) => post.writer == query.writerId)
            .map((comment) => comment.id),
    }
}
