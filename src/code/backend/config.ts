export type BackendConfig = {
    authBaseUrl: string;
    preferencesBaseUrl: string;
};

// TODO: inject per environment (build-time config / API gateway base URL).
// Hardcoded for local development, mirroring the existing patterns Persistence.
export const defaultBackendConfig: BackendConfig = {
    authBaseUrl: "http://localhost:5001",
    preferencesBaseUrl: "http://localhost:5002",
};
