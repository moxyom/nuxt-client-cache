export interface Comment {
    id: string
    writerSlug: string
    postSlug: string
    title: string
    content: string
}

const comments: Comment[] = [
    {
        id: "c1",
        writerSlug: "sophie-q",
        postSlug: "post1",
        title: "Super article",
        content: "Très clair pour commencer avec TS.",
    },
    {
        id: "c2",
        writerSlug: "elisa-design",
        postSlug: "post1",
        title: "Question",
        content: "Est-ce que tu couvres les Decorators bientôt ?",
    },
    {
        id: "c3",
        writerSlug: "claire-ux",
        postSlug: "post2",
        title: "Top",
        content: "Les Generics me faisaient peur, merci !",
    },
    {
        id: "c4",
        writerSlug: "alex-dev",
        postSlug: "post2",
        title: "Impressionnant",
        content: "Le futur de React s'annonce brillant.",
    },
    {
        id: "c5",
        writerSlug: "hugo-node",
        postSlug: "post3",
        title: "D'accord",
        content: "Le Server Components change tout.",
    },
    {
        id: "c6",
        writerSlug: "sam-cloud",
        postSlug: "post3",
        title: "Précision",
        content: "N'oublie pas de parler de l'event-driven.",
    },
    {
        id: "c7",
        writerSlug: "nina-art",
        postSlug: "post4",
        title: "Beau travail",
        content: "Le design est souvent négligé par les devs.",
    },
    {
        id: "c8",
        writerSlug: "victor-data",
        postSlug: "post5",
        title: "Utile",
        content: "Merci pour ces insights design.",
    },
    {
        id: "c9",
        writerSlug: "lea-java",
        postSlug: "post6",
        title: "Essentiel",
        content: "Le clean code devrait être obligatoire.",
    },
    {
        id: "c10",
        writerSlug: "marc-tech",
        postSlug: "post9",
        title: "Difficile",
        content: "Le refactoring est la partie la plus dure du job.",
    },
    {
        id: "c11",
        writerSlug: "jean-code",
        postSlug: "post11",
        title: "Déjà ?",
        content: "Next 15 sort vite !",
    },
    {
        id: "c12",
        writerSlug: "emma-vue",
        postSlug: "post12",
        title: "Wow",
        content: "Les nouvelles fonctionnalités sont dingues.",
    },
    {
        id: "c13",
        writerSlug: "alex-dev",
        postSlug: "post12",
        title: "Perf",
        content: "Le SSR gagne toujours sur le SEO.",
    },
    {
        id: "c14",
        writerSlug: "elisa-design",
        postSlug: "post16",
        title: "Enfin !",
        content: "Je galérais avec Flexbox, merci pour le Grid.",
    },
    {
        id: "c15",
        writerSlug: "max-python",
        postSlug: "post17",
        title: "Data",
        content: "Pandas est tellement puissant.",
    },
    {
        id: "c16",
        writerSlug: "sophie-q",
        postSlug: "post17",
        title: "Important",
        content: "On oublie trop souvent l'accessibilité.",
    },
    {
        id: "c17",
        writerSlug: "maya-css",
        postSlug: "post17",
        title: "Bravo",
        content: "Article très inclusif.",
    },
    {
        id: "c18",
        writerSlug: "lucie-sky",
        postSlug: "post18",
        title: "Question UX",
        content: "Comment recruter des testeurs ?",
    },
    {
        id: "c19",
        writerSlug: "ben-react",
        postSlug: "post19",
        title: "Coût",
        content: "Attention à la facture sur AWS !",
    },
    {
        id: "c20",
        writerSlug: "tom-web",
        postSlug: "post20",
        title: "Java!",
        content: "Enfin un article sur le backend solide.",
    },
]

export const findCommentById = async (opt: { id: string }) => {
    console.log("finding comment by id : " + opt.id)
    for (let k = 0; k < comments.length; k++) {
        const comment = comments[k]!

        if (comment.id == opt.id) {
            return { record: comment }
        }
    }

    return null
}

export const whereWriter = async (query: { writerSlug: string }) => {
    console.log("finding comment by writerSlug : " + query.writerSlug)
    return {
        ids: comments
            .filter((comment) => comment.writerSlug == query.writerSlug)
            .map((comment) => comment.id),
    }
}

export const wherePost = async (query: { postSlug: string }) => {
    console.log("finding comment by postSlug : " + query.postSlug)
    return {
        ids: comments
            .filter((comment) => comment.postSlug == query.postSlug)
            .map((comment) => comment.id),
    }
}
