import type {
    CrosslyDataModel,
    CreateResponse,
    GetAllResponse,
    Link,
} from "@textyly/crossly-private-persistence-contracts";
import { HttpError, IHttpClient } from "../http/types.js";
import { ICompressor, IPatternsClient } from "./types.js";

/** Collection endpoint for the patterns API (link paths cover the item endpoints). */
const PATTERNS_PATH: string = "/api/v1/patterns";

/**
 * Default {@link IPatternsClient}. Calls the persistence service through the
 * shared {@link IHttpClient} (which sends the session cookie), compressing
 * outgoing models and decompressing incoming ones via the {@link ICompressor}.
 * The service scopes every pattern to the caller's clientId from that cookie.
 */
export class PatternsClient implements IPatternsClient {
    private readonly http: IHttpClient;
    private readonly compressor: ICompressor;

    constructor(http: IHttpClient, compressor: ICompressor) {
        this.http = http;
        this.compressor = compressor;
    }

    public async getAll(): Promise<Link[]> {
        const response = await this.http.get<GetAllResponse>(PATTERNS_PATH);
        return response.links;
    }

    public async getById(getByIdPath: string): Promise<CrosslyDataModel> {
        const stream = await this.http.getStream(getByIdPath);
        return this.compressor.decompress(stream);
    }

    public async create(dataModel: CrosslyDataModel): Promise<Link> {
        const compressed = await this.compressor.compress(dataModel);
        const response = await this.http.post<CreateResponse>(PATTERNS_PATH, compressed);
        return response.link;
    }

    public async replace(replacePath: string, dataModel: CrosslyDataModel): Promise<boolean> {
        const compressed = await this.compressor.compress(dataModel);
        return this.toFound(() => this.http.put<void>(replacePath, compressed));
    }

    public rename(renamePath: string, newName: string): Promise<boolean> {
        return this.toFound(() => this.http.patch<void>(renamePath, { name: newName }));
    }

    public delete(deletePath: string): Promise<boolean> {
        return this.toFound(() => this.http.delete(deletePath));
    }

    /** Resolves true on success, false on 404 (not found); rethrows other errors. */
    private async toFound(operation: () => Promise<unknown>): Promise<boolean> {
        try {
            await operation();
            return true;
        } catch (error) {
            if (error instanceof HttpError && error.status === 404) {
                return false;
            }
            throw error;
        }
    }
}
