export interface Comment {
    id: string
    writerSlug: string
    title: string
    content: string
}

const comments: Comment[] = [
    { id: "c1", writerSlug: "sophie-q", title: "Super article", content: "Très clair pour commencer avec TS." },
    { id: "c2", writerSlug: "elisa-design", title: "Question", content: "Est-ce que tu couvres les Decorators bientôt ?" },
    { id: "c3", writerSlug: "claire-ux", title: "Top", content: "Les Generics me faisaient peur, merci !" },
    { id: "c4", writerSlug: "alex-dev", title: "Impressionnant", content: "Le futur de React s'annonce brillant." },
    { id: "c5", writerSlug: "hugo-node", title: "D'accord", content: "Le Server Components change tout." },
    { id: "c6", writerSlug: "sam-cloud", title: "Précision", content: "N'oublie pas de parler de l'event-driven." },
    { id: "c7", writerSlug: "nina-art", title: "Beau travail", content: "Le design est souvent négligé par les devs." },
    { id: "c8", writerSlug: "victor-data", title: "Utile", content: "Merci pour ces insights design." },
    { id: "c9", writerSlug: "lea-java", title: "Essentiel", content: "Le clean code devrait être obligatoire." },
    { id: "c10", writerSlug: "marc-tech", title: "Difficile", content: "Le refactoring est la partie la plus dure du job." },
    { id: "c11", writerSlug: "jean-code", title: "Déjà ?", content: "Next 15 sort vite !" },
    { id: "c12", writerSlug: "emma-vue", title: "Wow", content: "Les nouvelles fonctionnalités sont dingues." },
    { id: "c13", writerSlug: "alex-dev", title: "Perf", content: "Le SSR gagne toujours sur le SEO." },
    { id: "c14", writerSlug: "elisa-design", title: "Enfin !", content: "Je galérais avec Flexbox, merci pour le Grid." },
    { id: "c15", writerSlug: "max-python", title: "Data", content: "Pandas est tellement puissant." },
    { id: "c16", writerSlug: "sophie-q", title: "Important", content: "On oublie trop souvent l'accessibilité." },
    { id: "c17", writerSlug: "maya-css", title: "Bravo", content: "Article très inclusif." },
    { id: "c18", writerSlug: "lucie-sky", title: "Question UX", content: "Comment recruter des testeurs ?" },
    { id: "c19", writerSlug: "ben-react", title: "Coût", content: "Attention à la facture sur AWS !" },
    { id: "c20", writerSlug: "tom-web", title: "Java!", content: "Enfin un article sur le backend solide." }
]

export const findCommentById = async (id: string) => {
    console.log("finding comment by id : " + id)
    for (let k = 0; k < comments.length; k ++) {
        const comment = comments[k]!

        if (comment.id == id) {
            return comment
        }
    }

    return null 
}
