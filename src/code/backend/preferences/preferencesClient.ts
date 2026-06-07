import type {
    ClientPreferences,
    EditClientPreferencesRequest,
    SaveClientPreferencesRequest,
} from "@textyly/crossly-client-preferences-contracts";
import { HttpError, IHttpClient } from "../http/types.js";
import { IAuthClient } from "../auth/types.js";
import { IPreferencesClient, SavePreferences } from "./types.js";

/**
 * Default {@link IPreferencesClient}. Calls the preferences service through the
 * shared {@link IHttpClient} (which carries the bearer token) and scopes every
 * request to the current session's clientId from {@link IAuthClient}.
 */
export class PreferencesClient implements IPreferencesClient {
    private readonly http: IHttpClient;
    private readonly auth: IAuthClient;

    constructor(http: IHttpClient, auth: IAuthClient) {
        this.http = http;
        this.auth = auth;
    }

    public async get(): Promise<ClientPreferences | undefined> {
        const clientId = this.requireClientId();

        try {
            return await this.http.get<ClientPreferences>(`/preferences/${clientId}`);
        } catch (error) {
            if (error instanceof HttpError && error.status === 404) {
                return undefined;
            }
            throw error;
        }
    }

    public save(preferences: SavePreferences): Promise<ClientPreferences> {
        const clientId = this.requireClientId();
        const request: SaveClientPreferencesRequest = { clientId, ...preferences };

        return this.http.post<ClientPreferences>("/preferences", request);
    }

    public edit(changes: EditClientPreferencesRequest): Promise<ClientPreferences | undefined> {
        const clientId = this.requireClientId();

        return this.http.put<ClientPreferences>(`/preferences/${clientId}`, changes);
    }

    private requireClientId(): string {
        const clientId = this.auth.getClientId();
        if (!clientId) {
            throw new Error("no client id yet; call auth.ensureSession() before using preferences");
        }
        return clientId;
    }
}
