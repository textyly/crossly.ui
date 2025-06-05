import { CrosslyDataModel } from "../data-model/types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;
export type CrosslyCanvasPatternEx = CrosslyCanvasPattern & { name: string };

export type Link = { getById: string; replace: string; rename: string; delete: string };
export type Links = Array<Link>;

export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(dataModelStream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IPersistence {
    getAll(): Promise<Links>;
    getById(path: string): Promise<DataModelStream>;

    create(dataModel: DataModel): Promise<Link>;
    replace(path: string, dataModel: DataModel): Promise<boolean>;
    rename(path: string, newName: string): Promise<boolean>;
    delete(path: string): Promise<boolean>;
}

export interface IRepository {
    getAll(): Promise<Links>;
    getById(path: string): Promise<CrosslyCanvasPatternEx>;

    create(pattern: CrosslyCanvasPatternEx): Promise<Link>;
    replace(path: string, pattern: CrosslyCanvasPatternEx): Promise<boolean>;
    rename(path: string, newName: string): Promise<boolean>;
    delete(path: string): Promise<boolean>;
}