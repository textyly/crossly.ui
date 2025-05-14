import { CrosslyCanvasData } from "../canvas/types.js";
import { CrosslyDataModel } from "../data-model/types.js";

export type DataModelId = string;
export type DataModel = Uint8Array;
export type DataModelStream = ReadableStream<Uint8Array>;

export interface ICrosslyDataModelValidator {
    validateDataModel(dataModel: CrosslyDataModel): void;
    validateCanvasData(canvasData: CrosslyCanvasData): void;
}

export interface ICrosslyDataModelConverter {
    convertToDataModel(canvasData: CrosslyCanvasData): CrosslyDataModel;
    convertToCanvasData(dataModel: CrosslyDataModel): CrosslyCanvasData;
};

export interface ICrosslyDataModelSerializer {
    compressToGzip(data: CrosslyDataModel): Promise<Uint8Array>;
    decompressFromGzip(compressed: ReadableStream<Uint8Array>): Promise<CrosslyDataModel>;
}

export interface IRepositoryClient {
    save(dataModel: DataModel): Promise<DataModelId>;
    get(id: DataModelId): Promise<DataModelStream | null>;
}