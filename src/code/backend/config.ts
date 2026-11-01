export type BackendConfig = {
    authBaseUrl: string;
    preferencesBaseUrl: string;
    patternsBaseUrl: string;
};

// TODO: inject per environment (build-time config / API gateway base URL).
// Hardcoded for local development, mirroring the existing patterns Persistence.
export const defaultBackendConfig: BackendConfig = {
    authBaseUrl: "http://localhost:5001",
    preferencesBaseUrl: "http://localhost:5002",
    patternsBaseUrl: "http://localhost:5003",
};
