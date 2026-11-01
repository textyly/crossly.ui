import type { CrosslyDataModel } from "@textyly/crossly-private-persistence-contracts";
import { ICompressor } from "./types.js";

/**
 * Default {@link ICompressor} using the browser's `CompressionStream`/
 * `DecompressionStream`. The wire format is a gzip-compressed JSON serialization
 * of the data model — the same format crossly.private.persistence.service expects.
 */
export class GzipCompressor implements ICompressor {
    public async compress(dataModel: CrosslyDataModel): Promise<Uint8Array> {
        const input = new TextEncoder().encode(JSON.stringify(dataModel));

        const stream = new Blob([input]).stream().pipeThrough(new CompressionStream("gzip"));
        const buffer = await new Response(stream).arrayBuffer();

        return new Uint8Array(buffer);
    }

    public async decompress(stream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel> {
        const decompressed = stream.pipeThrough(new DecompressionStream("gzip"));
        const text = await new Response(decompressed).text();

        return JSON.parse(text) as CrosslyDataModel;
    }
}
