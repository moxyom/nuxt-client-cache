import { CacheError } from "./runtime/types/errors";
import { useCollectionBuilder, type Book, type Category } from "./test";
import userCollection from "./test"

const categoryCollection = useCollectionBuilder<Category>("category", async () => null)
    .build()

const bookCollection = useCollectionBuilder<Book>("book", async () => null)
    .withCustomSearch("name", async (name: string) => null)
    .withForeign("user", () => userCollection)
    .withForeign("category", categoryCollection)
    .withSubset("all", { fetchAll: async () => null, isIncluded: () => true })
    .build()

const myBook = await bookCollection({
    id: "som",
    withCategory: true 
})

if (myBook.value instanceof CacheError) {

}else {
    myBook.value.category.name
}
export default bookCollection
