import { AuthTokenProvider, HttpError, IHttpClient } from "./types.js";

/**
 * Default {@link IHttpClient} backed by the browser `fetch`.
 *
 * - Prefixes every path with the injected base URL.
 * - Attaches `Authorization: Bearer <token>` when a token provider yields one.
 * - Throws {@link HttpError} (with the status code) on any non-2xx response.
 */
export class HttpClient implements IHttpClient {
    private readonly baseUrl: string;
    private readonly getToken?: AuthTokenProvider;

    constructor(baseUrl: string, getToken?: AuthTokenProvider) {
        this.baseUrl = baseUrl;
        this.getToken = getToken;
    }

    public get<TResponse>(path: string): Promise<TResponse> {
        return this.request<TResponse>("GET", path);
    }

    public post<TResponse>(path: string, body?: unknown): Promise<TResponse> {
        return this.request<TResponse>("POST", path, body);
    }

    public put<TResponse>(path: string, body?: unknown): Promise<TResponse> {
        return this.request<TResponse>("PUT", path, body);
    }

    private async request<TResponse>(method: string, path: string, body?: unknown): Promise<TResponse> {
        const headers: Record<string, string> = {};

        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }

        const token = this.getToken?.();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(this.baseUrl + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        if (!response.ok) {
            throw new HttpError(response.status, `${method} ${path} failed with status ${response.status}`);
        }

        // Tolerate empty bodies (e.g. 204 No Content).
        const text = await response.text();
        return (text.length > 0 ? JSON.parse(text) : undefined) as TResponse;
    }
}
