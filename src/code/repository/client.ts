import { IRepositoryClient } from "./types.js";

export class RepositoryClient implements IRepositoryClient {

    public async save(data: Uint8Array): Promise<void> {
        console.log(`byte length: ${data.byteLength}`);
    }

    public async read(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
}