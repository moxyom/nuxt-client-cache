import type { ForeignCollection } from "../types/foreign"

const defineForeignCollection = <ForeignSchema>(name: string): ForeignCollection<ForeignSchema> => {
    return name
}

export default defineForeignCollection
