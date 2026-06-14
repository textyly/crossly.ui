/**
 * Client-side authentication against crossly.client.auth.service (BFF cookie
 * model). The session token lives in an httpOnly cookie the browser sends
 * automatically, so this client never sees a token — it learns identity from
 * `/auth/me` and triggers login/logout.
 *
 * Response shapes (`SessionResponse`, `MeResponse`) come from the published
 * `@textyly/crossly-client-auth-contracts` package.
 */
export interface IAuthClient {
    /** Ensure a session exists: adopt the current one, else create a guest. */
    ensureSession(): Promise<void>;

    /** The current client id, or undefined before {@link ensureSession}. */
    getClientId(): string | undefined;

    /** True for an anonymous guest; false once logged in. */
    isGuest(): boolean;

    /** Begin provider login (top-level redirect to the auth service). */
    login(): void;

    /** End the session; the next {@link ensureSession} starts a fresh guest. */
    logout(): Promise<void>;
}
