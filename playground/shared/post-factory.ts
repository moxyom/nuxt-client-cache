export interface Post {
    id: string
    writer: string
    title: string
    tags: string[]
    img: { alt: string, filename: string }
    comments: string[]
}

const posts: Post[] = [
    { id: "p1", writer: "u1", title: "Introduction à TypeScript", tags: ["ts", "js"], img: { alt: "TS Logo", filename: "ts.png" }, comments: ["c1", "c2"] },
    { id: "p2", writer: "u1", title: "Maîtriser Generics", tags: ["ts", "advanced"], img: { alt: "Code Abstract", filename: "code.jpg" }, comments: ["c3"] },
    { id: "p3", writer: "u2", title: "Le futur de React", tags: ["react", "web"], img: { alt: "React atom", filename: "react.png" }, comments: ["c4", "c5"] },
    { id: "p4", writer: "u3", title: "Architecture Microservices", tags: ["backend", "cloud"], img: { alt: "Server rack", filename: "cloud.png" }, comments: ["c6"] },
    { id: "p5", writer: "u3", title: "Docker en production", tags: ["devops", "docker"], img: { alt: "Whale", filename: "docker.jpg" }, comments: [] },
    { id: "p6", writer: "u4", title: "UI vs UX Design", tags: ["design", "ux"], img: { alt: "Interface mockup", filename: "design.png" }, comments: ["c7", "c8"] },
    { id: "p7", writer: "u5", title: "Clean Code en JS", tags: ["js", "best-practices"], img: { alt: "Clean desk", filename: "clean.png" }, comments: ["c9"] },
    { id: "p8", writer: "u5", title: "Refactoring Legacy", tags: ["js", "refactoring"], img: { alt: "Spaghetti code", filename: "legacy.png" }, comments: ["c10"] },
    { id: "p9", writer: "u6", title: "Apprendre par la pratique", tags: ["learning"], img: { alt: "Student", filename: "learn.jpg" }, comments: [] },
    { id: "p10", writer: "u7", title: "Next.js 15 Guide", tags: ["nextjs", "react"], img: { alt: "Next Logo", filename: "next.png" }, comments: ["c11", "c12"] },
    { id: "p11", writer: "u7", title: "SSR vs SSG", tags: ["web", "perf"], img: { alt: "Performance graph", filename: "perf.png" }, comments: ["c13"] },
    { id: "p12", writer: "u8", title: "CSS Grid Masterclass", tags: ["css", "design"], img: { alt: "Grid layout", filename: "grid.jpg" }, comments: ["c14"] },
    { id: "p13", writer: "u9", title: "Pandas pour les nuls", tags: ["python", "data"], img: { alt: "Panda", filename: "pandas.png" }, comments: ["c15"] },
    { id: "p14", writer: "u10", title: "Accessibilité Web", tags: ["a11y", "web"], img: { alt: "A11y icon", filename: "a11y.png" }, comments: ["c16", "c17"] },
    { id: "p15", writer: "u10", title: "User Research 101", tags: ["ux", "research"], img: { alt: "Interviews", filename: "ux.jpg" }, comments: ["c18"] },
    { id: "p16", writer: "u11", title: "AWS Lambda Secrets", tags: ["aws", "serverless"], img: { alt: "Lambda logo", filename: "aws.png" }, comments: ["c19"] },
    { id: "p17", writer: "u12", title: "Java Stream API", tags: ["java", "backend"], img: { alt: "Coffee bean", filename: "java.png" }, comments: ["c20"] },
    { id: "p18", writer: "u13", title: "Redux Toolkit", tags: ["react", "redux"], img: { alt: "State management", filename: "redux.png" }, comments: [] },
    { id: "p19", writer: "u14", title: "Vue 3 Composition API", tags: ["vue", "js"], img: { alt: "Vue logo", filename: "vue.png" }, comments: [] },
    { id: "p20", writer: "u15", title: "Node.js Streams", tags: ["node", "backend"], img: { alt: "Water stream", filename: "node.jpg" }, comments: [] }
]

export const findPostById = async (id: string) => {
    console.log("finding user by id : " + id)
    for (let k = 0; k < posts.length; k ++) {
        const post = posts[k]!

        if (post.id == id) {
            return post
        }
    }

    return null 
}
