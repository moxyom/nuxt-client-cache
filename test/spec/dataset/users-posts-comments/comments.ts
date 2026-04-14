import { defineMoxCacheCollection } from "~/src/runtime/core"
import { shallowCollectionFor } from "~/src/runtime/types"
import type { User } from "./users"
import { vi } from "vitest"

export interface Comment {
    customId: string
    writerSlug: string
    title: string
    content: string
}

const comments: Comment[] = [
    { customId: "c1", writerSlug: "sophie-q", title: "Super article", content: "Très clair pour commencer avec TS." },
    { customId: "c2", writerSlug: "elisa-design", title: "Question", content: "Est-ce que tu couvres les Decorators bientôt ?" },
    { customId: "c3", writerSlug: "claire-ux", title: "Top", content: "Les Generics me faisaient peur, merci !" },
    { customId: "c4", writerSlug: "alex-dev", title: "Impressionnant", content: "Le futur de React s'annonce brillant." },
    { customId: "c5", writerSlug: "hugo-node", title: "D'accord", content: "Le Server Components change tout." },
    { customId: "c6", writerSlug: "sam-cloud", title: "Précision", content: "N'oublie pas de parler de l'event-driven." },
    { customId: "c7", writerSlug: "nina-art", title: "Beau travail", content: "Le design est souvent négligé par les devs." },
    { customId: "c8", writerSlug: "victor-data", title: "Utile", content: "Merci pour ces insights design." },
    { customId: "c9", writerSlug: "lea-java", title: "Essentiel", content: "Le clean code devrait être obligatoire." },
    { customId: "c10", writerSlug: "marc-tech", title: "Difficile", content: "Le refactoring est la partie la plus dure du job." },
    { customId: "c11", writerSlug: "jean-code", title: "Déjà ?", content: "Next 15 sort vite !" },
    { customId: "c12", writerSlug: "emma-vue", title: "Wow", content: "Les nouvelles fonctionnalités sont dingues." },
    { customId: "c13", writerSlug: "alex-dev", title: "Perf", content: "Le SSR gagne toujours sur le SEO." },
    { customId: "c14", writerSlug: "elisa-design", title: "Enfin !", content: "Je galérais avec Flexbox, merci pour le Grid." },
    { customId: "c15", writerSlug: "max-python", title: "Data", content: "Pandas est tellement puissant." },
    { customId: "c16", writerSlug: "sophie-q", title: "Important", content: "On oublie trop souvent l'accessibilité." },
    { customId: "c17", writerSlug: "maya-css", title: "Bravo", content: "Article très inclusif." },
    { customId: "c18", writerSlug: "lucie-sky", title: "Question UX", content: "Comment recruter des testeurs ?" },
    { customId: "c19", writerSlug: "ben-react", title: "Coût", content: "Attention à la facture sur AWS !" },
    { customId: "c20", writerSlug: "tom-web", title: "Java!", content: "Enfin un article sur le backend solide." }
]

const findCommentById = vi.fn(
    async (id: string) => comments
        .find((c) => c.customId == id) ?? null
)

export const commentCollection = defineMoxCacheCollection<Comment>("comment", findCommentById)
    .withIdField("customId")
    .withShallowForeign("writerSlug", { 
        collection: shallowCollectionFor<User>("user"), 
        searchBy: {
            name: "slug",
            transform: (c: Comment) => { return { searchBy: "slug", slug: c.writerSlug } }
        }
    })
    .build()

export const mocked = {
    findCommentById
}
