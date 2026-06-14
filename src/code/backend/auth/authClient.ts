import { HttpError, IHttpClient } from "../http/types.js";
import { IAuthClient, SessionSummary } from "./types.js";

/**
 * Default {@link IAuthClient}. Talks to crossly.client.auth.service in the BFF
 * cookie model: the session JWT rides in an httpOnly cookie the browser manages,
 * so this client holds no token. It learns identity from `/auth/me` and caches it
 * in memory.
 *
 * {@link ensureSession} adopts AND rolls forward (slides) an existing session —
 * guest or logged-in — so an active user's expiry keeps moving and they don't get
 * logged out; if there is none, it mints a guest. {@link login}/{@link logout}
 * drive the OAuth redirect and sign-out; promote-in-place on the server means a
 * guest's data carries into their account on first login with no change here.
 */
export class AuthClient implements IAuthClient {
    private clientId?: string;
    private guest: boolean = true;

    constructor(
        private readonly http: IHttpClient,
        private readonly authBaseUrl: string,
        private readonly windowRef: Window,
    ) {}

    public async ensureSession(): Promise<void> {
        // Roll the current session forward (sliding): /auth/refresh re-issues the
        // cookie with a fresh expiry and returns the identity — for a guest or an
        // authenticated user alike. A 401 means there's no valid session yet, so
        // we fall through and mint a fresh guest.
        try {
            const session = await this.http.post<SessionSummary>("/auth/refresh");
            this.clientId = session.clientId;
            this.guest = session.guest;
            return;
        } catch (error) {
            if (!(error instanceof HttpError) || error.status !== 401) {
                throw error;
            }
        }

        const guest = await this.http.post<SessionSummary>("/auth/guest");
        this.clientId = guest.clientId;
        this.guest = guest.guest;
    }

    public getClientId(): string | undefined {
        return this.clientId;
    }

    public isGuest(): boolean {
        return this.guest;
    }

    public login(): void {
        // Top-level navigation: the auth service runs the OAuth round-trip and
        // redirects back, setting the session cookie.
        this.windowRef.location.assign(`${this.authBaseUrl}/auth/login`);
    }

    public async logout(): Promise<void> {
        await this.http.post<void>("/auth/logout");
        this.clientId = undefined;
        this.guest = true;
    }
}
