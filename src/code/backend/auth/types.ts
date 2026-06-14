/**
 * Identity of the current session, as returned by `GET /auth/me`.
 *
 * Mirrors the auth service's `MeResponse` contract. Defined locally so the UI
 * isn't blocked on a contract republish; switch to importing it from
 * `@textyly/crossly-client-auth-contracts` once that version is published.
 */
export interface MeResponse {
    clientId: string;
    guest: boolean;
    email?: string;
}

/** Minimal session summary returned by `POST /auth/guest`. */
export interface SessionSummary {
    clientId: string;
    guest: boolean;
}

/**
 * Client-side authentication against crossly.client.auth.service (BFF cookie
 * model). The session token lives in an httpOnly cookie the browser sends
 * automatically, so this client never sees a token — it learns identity from
 * `/auth/me` and triggers login/logout.
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
