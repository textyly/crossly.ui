import { CrosslyDataModel } from "../data-model/types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

export type Id = string;
export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;

export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(dataModelStream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IPersistence {
    save(dataModel: DataModel): Promise<Id>;
    get(id: Id): Promise<DataModelStream>;
}

export interface IRepository {
    save(pattern: CrosslyCanvasPattern): Promise<Id>;
    get(id: Id): Promise<CrosslyCanvasPattern>;
}