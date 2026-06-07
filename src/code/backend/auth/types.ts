/** Small persistence boundary for the access token + client id (e.g. localStorage). */
export interface ITokenStorage {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    remove(key: string): void;
}

/**
 * Client-side authentication. Establishes and rolls forward an anonymous guest
 * session against crossly.client.auth.service, and exposes the current token and
 * clientId for use as `Authorization: Bearer` and as the data-owner identity.
 */
export interface IAuthClient {
    /** Refresh the stored session if present, otherwise create a new guest session. */
    ensureSession(): Promise<void>;

    /** The current access token, or undefined if no session has been established. */
    getToken(): string | undefined;

    /** The current client id (the token's subject), or undefined. */
    getClientId(): string | undefined;
}
