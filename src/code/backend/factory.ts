import { BackendConfig, defaultBackendConfig } from "./config.js";
import { HttpClient } from "./http/httpClient.js";
import { AuthClient } from "./auth/authClient.js";
import { PreferencesClient } from "./preferences/preferencesClient.js";
import { IAuthClient } from "./auth/types.js";
import { IPreferencesClient } from "./preferences/types.js";
import { PatternsClient } from "./patterns/patternsClient.js";
import { GzipCompressor } from "./patterns/gzipCompressor.js";
import { IPatternsClient } from "./patterns/types.js";

/** The wired-up backend: an auth session plus per-service clients. */
export type Backend = {
    auth: IAuthClient;
    preferences: IPreferencesClient;
    patterns: IPatternsClient;
};

/**
 * Composition root for the UI's backend layer. Each service gets its own
 * credentialed {@link HttpClient}; the browser carries the httpOnly session cookie
 * the auth service sets, so there is no shared token to thread through. Identity is
 * established by {@link AuthClient.ensureSession} and enforced server-side.
 */
export class BackendFactory {
    public create(window: Window, config: BackendConfig = defaultBackendConfig): Backend {
        const auth = new AuthClient(new HttpClient(config.authBaseUrl), config.authBaseUrl, window);
        const preferences = new PreferencesClient(new HttpClient(config.preferencesBaseUrl));
        const patterns = new PatternsClient(new HttpClient(config.patternsBaseUrl), new GzipCompressor());

        return { auth, preferences, patterns };
    }
}
