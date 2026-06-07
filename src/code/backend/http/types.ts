/** Supplies the current access token (if any) for the Authorization header. */
export type AuthTokenProvider = () => string | undefined;

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
 * base-URL handling, bearer auth, JSON, and status/error mapping so individual
 * service clients (auth, preferences, …) don't re-implement fetch.
 */
export interface IHttpClient {
    get<TResponse>(path: string): Promise<TResponse>;
    post<TResponse>(path: string, body?: unknown): Promise<TResponse>;
    put<TResponse>(path: string, body?: unknown): Promise<TResponse>;
}
