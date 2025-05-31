import { CrosslyDataModel } from "../data-model/types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

export type Id = string;
export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;
export type CrosslyCanvasPatternEx = CrosslyCanvasPattern & { name: string };

export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(dataModelStream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IPersistence {
    getAll(): Promise<Array<Id>>;
    getById(id: Id): Promise<DataModelStream>;

    delete(id: string): Promise<boolean>;
    create(dataModel: DataModel): Promise<Id>;
    rename(id: string, newName: string): Promise<boolean>;
    replace(id: string, dataModel: DataModel): Promise<boolean>;
}

export interface IRepository {
    getAll(): Promise<Array<Id>>;
    getById(id: Id): Promise<CrosslyCanvasPatternEx>;

    delete(id: string): Promise<boolean>;
    create(pattern: CrosslyCanvasPatternEx): Promise<Id>;
    rename(id: string, newName: string): Promise<boolean>;
    replace(id: string, pattern: CrosslyCanvasPatternEx): Promise<boolean>;
}