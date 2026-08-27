export abstract class CacheError extends Error {
    protected abstract readonly priority: number

    constructor(message: string) {
        super(message)
        this.name = new.target.name
    }

    public abstract prefixWith(prefix: string): CacheError

    static compare(a: CacheError, b: CacheError) {
        return a.priority - b.priority
    }
}

abstract class FieldCacheError extends CacheError {
    protected field: string

    constructor(message: string, field?: string) {
        field = field || "self"
        super(`[${field}]: ${message}`)

        this.field = field
        this.name = new.target.name
    }

    protected static prefix(field: string, prefix: string) {
        return field != "self" ? `${prefix}->${field}` : prefix
    }
}

export class ValidationError<T> extends FieldCacheError {
    protected override priority: number = 0
    readonly data: T

    constructor(data: T, field?: string) {
        super(data + "", field)
        this.data = data
    }

    public override prefixWith(prefix: string): CacheError {
        return new ValidationError(
            this.message,
            FieldCacheError.prefix(this.field, prefix),
        )
    }
}

export class NotFoundError extends FieldCacheError {
    protected override priority: number = 1

    public override prefixWith(prefix: string): CacheError {
        return new NotFoundError(
            this.message,
            FieldCacheError.prefix(this.field, prefix),
        )
    }
}

export type ProvidedFunction =
    | "validate"
    | "search by id"
    | `search by ${string}`
    | `search ${string} scope ids`

export class UnexpectedReturnTypeError extends CacheError {
    protected override priority: number = 2
    readonly collection: string
    readonly providedFunction: ProvidedFunction

    constructor(
        collection: string,
        providedFunction: ProvidedFunction,
        message: string,
    ) {
        super(
            `[${collection} - provided function to ${providedFunction}]: ${message}`,
        )

        this.collection = collection
        this.providedFunction = providedFunction
    }

    public override prefixWith(): CacheError {
        return new UnexpectedReturnTypeError(
            this.collection,
            this.providedFunction,
            this.message,
        )
    }
}

export class ConfigurationError extends CacheError {
    protected override priority: number = 3
    readonly collection: string

    constructor(collection: string, message: string) {
        super(`[${collection}]: ${message}`)

        this.collection = collection
    }

    public override prefixWith(): CacheError {
        return new ConfigurationError(this.collection, this.message)
    }
}

export class InternalError extends CacheError {
    protected override priority: number = 4

    public override prefixWith(): CacheError {
        return new InternalError(this.message)
    }
}
