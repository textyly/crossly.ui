import type { GuestSessionResponse } from "@textyly/crossly-client-auth-contracts";
import { IHttpClient } from "../http/types.js";
import { IAuthClient, ITokenStorage } from "./types.js";

/** localStorage keys for the persisted session. */
export const STORAGE_KEYS = {
    token: "crossly.auth.token",
    clientId: "crossly.auth.clientId",
} as const;

/**
 * Default {@link IAuthClient}. Talks to crossly.client.auth.service and persists
 * the session via the injected {@link ITokenStorage}.
 *
 * Phase 1 is anonymous-only: {@link ensureSession} refreshes an existing guest
 * session (rolling its 1-year expiry forward) or creates a new one. When real
 * login is added later it issues a token of the same shape, so this client only
 * needs new methods, not a rewrite.
 */
export class AuthClient implements IAuthClient {
    private readonly http: IHttpClient;
    private readonly storage: ITokenStorage;

    constructor(http: IHttpClient, storage: ITokenStorage) {
        this.http = http;
        this.storage = storage;
    }

    public async ensureSession(): Promise<void> {
        const existing = this.storage.get(STORAGE_KEYS.token);

        if (existing) {
            try {
                await this.refresh();
                return;
            } catch {
                // Stored token is invalid/expired (e.g. away > 1 year) -> start fresh.
            }
        }

        await this.createGuest();
    }

    public getToken(): string | undefined {
        return this.storage.get(STORAGE_KEYS.token);
    }

    public getClientId(): string | undefined {
        return this.storage.get(STORAGE_KEYS.clientId);
    }

    private async createGuest(): Promise<void> {
        const session = await this.http.post<GuestSessionResponse>("/auth/guest");
        this.store(session);
    }

    private async refresh(): Promise<void> {
        // The HttpClient attaches the stored token as a bearer automatically.
        const session = await this.http.post<GuestSessionResponse>("/auth/refresh");
        this.store(session);
    }

    private store(session: GuestSessionResponse): void {
        this.storage.set(STORAGE_KEYS.token, session.token);
        this.storage.set(STORAGE_KEYS.clientId, session.clientId);
    }
}
