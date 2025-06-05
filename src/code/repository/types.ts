import { CrosslyDataModel } from "../data-model/types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

export type DataModelId = string;
export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;
export type CrosslyCanvasPatternEx = CrosslyCanvasPattern & { name: string };

export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(dataModelStream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IPersistence {
    getAll(): Promise<Array<DataModelId>>;
    getById(id: DataModelId): Promise<DataModelStream>;

    create(dataModel: DataModel): Promise<DataModelId>;
    replace(id: DataModelId, dataModel: DataModel): Promise<boolean>;
    rename(id: DataModelId, newName: string): Promise<boolean>;
    delete(id: DataModelId): Promise<boolean>;
}

export interface IRepository {
    getAll(): Promise<Array<DataModelId>>;
    getById(id: DataModelId): Promise<CrosslyCanvasPatternEx>;

    create(pattern: CrosslyCanvasPatternEx): Promise<DataModelId>;
    replace(id: DataModelId, pattern: CrosslyCanvasPatternEx): Promise<boolean>;
    rename(id: DataModelId, newName: string): Promise<boolean>;
    delete(id: DataModelId): Promise<boolean>;
}