/** Error thrown for non-2xx HTTP responses, carrying the status code. */
export class HttpError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/**
 * Minimal HTTP boundary shared by every backend service client. Centralizes
 * base-URL handling, JSON, and status/error mapping so individual service clients
 * (auth, preferences, patterns, …) don't re-implement fetch.
 *
 * Every request is sent with credentials (`credentials: "include"`) so the
 * httpOnly session cookie set by the auth service rides along — there is no
 * bearer token in JS. JSON is the default; a `Uint8Array` body is sent as raw
 * bytes, and `getStream` returns the raw response stream (gzip pattern payloads).
 */
export interface IHttpClient {
    get<TResponse>(path: string): Promise<TResponse>;
    getStream(path: string): Promise<ReadableStream<Uint8Array>>;
    post<TResponse>(path: string, body?: unknown): Promise<TResponse>;
    put<TResponse>(path: string, body?: unknown): Promise<TResponse>;
    patch<TResponse>(path: string, body?: unknown): Promise<TResponse>;
    delete(path: string): Promise<void>;
}
