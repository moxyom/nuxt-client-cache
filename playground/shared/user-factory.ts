export interface User {
    id: string,
    slug: string,
    age: number
    posts: string[]
}

const users: User[] = [
    { id: "u1", slug: "alex-dev", age: 15, posts: ["p1", "p2"] },
    { id: "u2", slug: "sophie-q", age: 24, posts: ["p3"] },
    { id: "u3", slug: "marc-tech", age: 35, posts: ["p4", "p5"] },
    { id: "u4", slug: "elisa-design", age: 31, posts: ["p6"] },
    { id: "u5", slug: "jean-code", age: 42, posts: ["p7", "p8"] },
    { id: "u6", slug: "lucie-sky", age: 17, posts: ["p9"] },
    { id: "u7", slug: "tom-web", age: 27, posts: ["p10", "p11"] },
    { id: "u8", slug: "nina-art", age: 23, posts: ["p12"] },
    { id: "u9", slug: "victor-data", age: 38, posts: ["p13"] },
    { id: "u10", slug: "claire-ux", age: 29, posts: ["p14", "p15"] },
    { id: "u11", slug: "sam-cloud", age: 33, posts: ["p16"] },
    { id: "u12", slug: "lea-java", age: 26, posts: ["p17"] },
    { id: "u13", slug: "ben-react", age: 30, posts: ["p18"] },
    { id: "u14", slug: "emma-vue", age: 16, posts: ["p19"] },
    { id: "u15", slug: "hugo-node", age: 40, posts: ["p20"] },
    { id: "u16", slug: "zoe-rust", age: 22, posts: [] },
    { id: "u17", slug: "max-python", age: 36, posts: [] },
    { id: "u18", slug: "ana-go", age: 31, posts: [] },
    { id: "u19", slug: "paul-sql", age: 16, posts: [] },
    { id: "u20", slug: "maya-css", age: 21, posts: [] }
]

export const findUserById = async (id: string) => {
    console.log("finding user by id : " + id)
    for (let k = 0; k < users.length; k ++) {
        const user = users[k]!

        if (user.id == id) {
            return user
        }
    }

    return null 
}

export const findUserBySlug = async (params: { slug: string }) => {
    console.log("finding user by slug : " + params.slug)
    for (let k = 0; k < users.length; k ++) {
        const user = users[k]!

        if (user.slug == params.slug) {
            return user
        }
    }
    
    return null 
}

export const findMajorUsers = async () => {
    console.log("computing major users")
    return users.filter((u) => u.age >= 18).map(u => u.id)
}
export const findUsersWithPosts = async (start: number, end: number) => {
    console.log("computing users with no posts")
    return users.filter((u) => u.posts.length > 0).slice(start, end).map(u => u.id)
}
