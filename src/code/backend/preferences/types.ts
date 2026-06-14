import type {
    ClientPreferences,
    SaveClientPreferencesRequest,
} from "@textyly/crossly-client-preferences-contracts";

/**
 * Client for crossly.client.preferences.service. Identity comes from the session
 * cookie, so callers never pass (or can spoof) a clientId.
 */
export interface IPreferencesClient {
    /** Read this client's preferences (the service returns defaults if none saved). */
    get(): Promise<ClientPreferences>;

    /** Create/update this client's preferences (partial; unspecified fields preserved). */
    save(preferences: SaveClientPreferencesRequest): Promise<ClientPreferences>;

    /** Reset this client's preferences to defaults (server deletes the stored record). */
    reset(): Promise<void>;
}
