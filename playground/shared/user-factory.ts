export interface User {
    id: string
    slug: string
    age: number
}

const users: User[] = [
    { id: "u1", slug: "alex-dev", age: 15 },
    { id: "u2", slug: "sophie-q", age: 24 },
    { id: "u3", slug: "marc-tech", age: 35 },
    { id: "u4", slug: "elisa-design", age: 31 },
    { id: "u5", slug: "jean-code", age: 42 },
    { id: "u6", slug: "lucie-sky", age: 17 },
    { id: "u7", slug: "tom-web", age: 27 },
    { id: "u8", slug: "nina-art", age: 23 },
    { id: "u9", slug: "victor-data", age: 38 },
    { id: "u10", slug: "claire-ux", age: 29 },
    { id: "u11", slug: "sam-cloud", age: 33 },
    { id: "u12", slug: "lea-java", age: 26 },
    { id: "u13", slug: "ben-react", age: 30 },
    { id: "u14", slug: "emma-vue", age: 16 },
    { id: "u15", slug: "hugo-node", age: 40 },
    { id: "u16", slug: "zoe-rust", age: 22 },
    { id: "u17", slug: "max-python", age: 36 },
    { id: "u18", slug: "ana-go", age: 31 },
    { id: "u19", slug: "paul-sql", age: 16 },
    { id: "u20", slug: "maya-css", age: 21 },
]

export const findUserById = async (query: { id: string }) => {
    console.log("finding user by id : " + query.id)
    for (let k = 0; k < users.length; k++) {
        const user = users[k]!

        if (user.id == query.id) {
            return {
                record: user,
            }
        }
    }

    return null
}

export const findUserBySlug = async (params: { slug: string }) => {
    console.log("finding user by slug : " + params.slug)
    for (let k = 0; k < users.length; k++) {
        const user = users[k]!

        if (user.slug == params.slug) {
            return { record: user }
        }
    }

    return null
}

export const findMajorUsers = async () => {
    console.log("computing major users")
    return users.filter((u) => u.age >= 18).map((u) => u.id)
}
