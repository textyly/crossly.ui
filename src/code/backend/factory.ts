import { BackendConfig, defaultBackendConfig } from "./config.js";
import { HttpClient } from "./http/httpClient.js";
import { AuthClient, STORAGE_KEYS } from "./auth/authClient.js";
import { LocalStorageTokenStorage } from "./auth/localStorageTokenStorage.js";
import { PreferencesClient } from "./preferences/preferencesClient.js";
import { IAuthClient } from "./auth/types.js";
import { IPreferencesClient } from "./preferences/types.js";

/** The wired-up backend: an auth session plus per-service clients. */
export type Backend = {
    auth: IAuthClient;
    preferences: IPreferencesClient;
};

/**
 * Composition root for the UI's backend layer. Wires storage -> auth ->
 * per-service HTTP clients. Every client shares one token provider, so once a
 * session exists, all requests carry the same bearer token.
 */
export class BackendFactory {
    public create(window: Window, config: BackendConfig = defaultBackendConfig): Backend {
        const storage = new LocalStorageTokenStorage(window.localStorage);
        const tokenProvider = (): string | undefined => storage.get(STORAGE_KEYS.token);

        const authHttp = new HttpClient(config.authBaseUrl, tokenProvider);
        const auth = new AuthClient(authHttp, storage);

        const preferencesHttp = new HttpClient(config.preferencesBaseUrl, tokenProvider);
        const preferences = new PreferencesClient(preferencesHttp, auth);

        return { auth, preferences };
    }
}
