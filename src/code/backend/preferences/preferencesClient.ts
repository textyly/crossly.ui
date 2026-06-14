import type { ClientPreferences } from "@textyly/crossly-client-preferences-contracts";
import { IHttpClient } from "../http/types.js";
import { IPreferencesClient, SavePreferences } from "./types.js";

/**
 * Default {@link IPreferencesClient}. Calls the preferences service through the
 * shared {@link IHttpClient} (which sends the session cookie). The service derives
 * the clientId from that cookie, so requests are identity-implicit — no clientId
 * in the path or body.
 */
export class PreferencesClient implements IPreferencesClient {
    private readonly http: IHttpClient;

    constructor(http: IHttpClient) {
        this.http = http;
    }

    public get(): Promise<ClientPreferences> {
        return this.http.get<ClientPreferences>("/preferences");
    }

    public save(preferences: SavePreferences): Promise<ClientPreferences> {
        return this.http.put<ClientPreferences>("/preferences", preferences);
    }
}
