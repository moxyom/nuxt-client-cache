/**
 * stringify with keys sorted, to compare serialization
 * @param obj the object to serialize
 * @returns a string representation of the object
 */
export function stableStringify(obj: unknown): string {
    if (typeof obj == "string") { return obj }

    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(",")}]`
    }

    const keys = Object.keys(obj).sort()
    return `{${keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(k => `${JSON.stringify(k)}:${stableStringify((obj as any)[k])}`)
        .join(",")}}`
}
