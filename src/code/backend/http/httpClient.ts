import { AuthTokenProvider, HttpError, IHttpClient } from "./types.js";

/**
 * Default {@link IHttpClient} backed by the browser `fetch`.
 *
 * - Prefixes every path with the injected base URL.
 * - Attaches `Authorization: Bearer <token>` when a token provider yields one.
 * - Sends a `Uint8Array` body as raw bytes (application/octet-stream); any other
 *   defined body is JSON-encoded.
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

    public patch<TResponse>(path: string, body?: unknown): Promise<TResponse> {
        return this.request<TResponse>("PATCH", path, body);
    }

    public delete(path: string): Promise<void> {
        return this.request<void>("DELETE", path);
    }

    public async getStream(path: string): Promise<ReadableStream<Uint8Array>> {
        const response = await fetch(this.baseUrl + path, { method: "GET", headers: this.buildHeaders() });

        if (!response.ok) {
            throw new HttpError(response.status, `GET ${path} failed with status ${response.status}`);
        }
        if (!response.body) {
            throw new HttpError(response.status, `GET ${path} returned no body`);
        }

        return response.body;
    }

    private async request<TResponse>(method: string, path: string, body?: unknown): Promise<TResponse> {
        const headers = this.buildHeaders();
        let fetchBody: BodyInit | undefined;

        if (body instanceof Uint8Array) {
            headers["Content-Type"] = "application/octet-stream";
            // Copy into an ArrayBuffer-backed view so it satisfies BodyInit across TS lib versions.
            fetchBody = new Uint8Array(body);
        } else if (body !== undefined) {
            headers["Content-Type"] = "application/json";
            fetchBody = JSON.stringify(body);
        }

        const response = await fetch(this.baseUrl + path, { method, headers, body: fetchBody });

        if (!response.ok) {
            throw new HttpError(response.status, `${method} ${path} failed with status ${response.status}`);
        }

        // Tolerate empty bodies (e.g. 204 No Content).
        const text = await response.text();
        return (text.length > 0 ? JSON.parse(text) : undefined) as TResponse;
    }

    private buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {};

        const token = this.getToken?.();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }
}
