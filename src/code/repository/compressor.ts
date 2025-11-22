import { ICompressor } from "./types.js";
import { CrosslyDataModel } from "../data-model/types.js";

export class Compressor implements ICompressor {

    public async compress(dataModel: CrosslyDataModel): Promise<Uint8Array> {
        const json = JSON.stringify(dataModel);

        const encoder = new TextEncoder();
        const input = encoder.encode(json);

        const cs = new CompressionStream("gzip");
        const compressedStream = new Blob([input]).stream().pipeThrough(cs);
        const compressedBlob = await new Response(compressedStream).blob();
        const buffer = await compressedBlob.arrayBuffer();

        return new Uint8Array(buffer);
    }

    public async decompress(compressedDataModel: ReadableStream<Uint8Array>): Promise<CrosslyDataModel> {
        const ds = new DecompressionStream("gzip") as any;

        const decompressedStream = compressedDataModel.pipeThrough(ds);
        const decompressedBlob = await new Response(decompressedStream).blob();
        const text = await decompressedBlob.text();

        const dataModel = JSON.parse(text);
        return dataModel;
    }
}