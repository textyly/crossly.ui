import { CrosslyDataModel, ICrosslyDataModelSerializer } from "./types.js";

export class CrosslyDataModelSerializer implements ICrosslyDataModelSerializer {

    public async compressToGzip(dataModel: CrosslyDataModel): Promise<Uint8Array> {
        const json = JSON.stringify(dataModel);

        const encoder = new TextEncoder();
        const input = encoder.encode(json);

        const cs = new CompressionStream('gzip');
        const compressedStream = new Blob([input]).stream().pipeThrough(cs);
        const compressedBlob = await new Response(compressedStream).blob();
        const buffer = await compressedBlob.arrayBuffer();

        return new Uint8Array(buffer);
    }

    public async decompressFromGzip(compressedDataModel: Uint8Array): Promise<CrosslyDataModel> {
        const ds = new DecompressionStream('gzip');

        const decompressedStream = new Blob([compressedDataModel]).stream().pipeThrough(ds);
        const decompressedBlob = await new Response(decompressedStream).blob();
        const text = await decompressedBlob.text();

        return JSON.parse(text);
    }
}