import { CrosslyCanvasData } from "../canvas/types.js";
import { CrosslyDataModel } from "../data-model/types.js";

export type Id = string;
export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;

export interface IValidator {
    validateDataModel(dataModel: CrosslyDataModel): void;
    validateCanvasData(canvasData: CrosslyCanvasData): void;
}

export interface IConverter {
    convertToDataModel(canvasData: CrosslyCanvasData): CrosslyDataModel;
    convertToCanvasData(dataModel: CrosslyDataModel): CrosslyCanvasData;
};

export interface ICompressor {
    compress(dataModel: CrosslyDataModel): Promise<Uint8Array>;
    decompress(dataModelStream: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IPersistence {
    save(dataModel: DataModel): Promise<Id>;
    get(id: Id): Promise<DataModelStream | null>;
}

export interface IRepository {
    save(canvasData: CrosslyCanvasData): Promise<Id>;
    get(id: Id): Promise<CrosslyCanvasData>;
}