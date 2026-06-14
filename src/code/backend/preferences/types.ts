import type { ClientPreferences, Theme } from "@textyly/crossly-client-preferences-contracts";

/**
 * The preferences payload a caller supplies on save. Identity is NOT included —
 * the server derives the clientId from the session cookie. (Mirrors the service's
 * clientId-less `SaveClientPreferencesRequest`; kept local so the UI isn't blocked
 * on a contract republish.)
 */
export interface SavePreferences {
    theme?: Theme;
    language?: string;
    settings?: Record<string, unknown>;
}

/**
 * Client for crossly.client.preferences.service. Identity comes from the session
 * cookie, so callers never pass (or can spoof) a clientId.
 */
export interface IPreferencesClient {
    /** Read this client's preferences (the service returns defaults if none saved). */
    get(): Promise<ClientPreferences>;

    /** Create/update this client's preferences (partial; unspecified fields preserved). */
    save(preferences: SavePreferences): Promise<ClientPreferences>;
}
