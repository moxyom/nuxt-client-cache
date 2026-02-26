export class CacheError extends Error {
    constructor(
        public field: string,
        message: string
    ) {
        super(message);

        // ts 
        this.name = 'CacheError'
        Object.setPrototypeOf(this, CacheError.prototype)
    }

    public prefixFieldWith(str: string) {
        this.field = `${str} -> ${this.field}`
        return this
    }
}
