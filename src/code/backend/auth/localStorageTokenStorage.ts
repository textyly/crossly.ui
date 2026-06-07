import { ITokenStorage } from "./types.js";

/**
 * {@link ITokenStorage} backed by a Web Storage object (typically
 * `window.localStorage`). The storage is injected so the auth client can be
 * unit-tested with an in-memory fake.
 */
export class LocalStorageTokenStorage implements ITokenStorage {
    private readonly storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    public get(key: string): string | undefined {
        return this.storage.getItem(key) ?? undefined;
    }

    public set(key: string, value: string): void {
        this.storage.setItem(key, value);
    }

    public remove(key: string): void {
        this.storage.removeItem(key);
    }
}
