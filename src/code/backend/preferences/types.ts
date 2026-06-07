import type {
    ClientPreferences,
    EditClientPreferencesRequest,
    SaveClientPreferencesRequest,
} from "@textyly/crossly-client-preferences-contracts";

/** The preferences payload a caller supplies; the clientId is added from the session. */
export type SavePreferences = Omit<SaveClientPreferencesRequest, "clientId">;

/**
 * Client for crossly.client.preferences.service. The current clientId is taken
 * from the auth session, so callers never pass it (and cannot spoof it).
 */
export interface IPreferencesClient {
    /** Read this client's preferences, or undefined if none are stored yet. */
    get(): Promise<ClientPreferences | undefined>;

    /** Create/overwrite this client's preferences. */
    save(preferences: SavePreferences): Promise<ClientPreferences>;

    /** Apply a partial change to this client's preferences. */
    edit(changes: EditClientPreferencesRequest): Promise<ClientPreferences | undefined>;
}
