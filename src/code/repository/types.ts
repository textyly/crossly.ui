import { CrosslyCanvasData } from "../canvas/types.js";
import { CrosslyDataModel } from "../data-model/types.js";

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
    decompressFromGzip(compressed: Uint8Array): Promise<CrosslyDataModel>;
}

export interface IRepositoryClient {
    save(data: Uint8Array): Promise<void>;
    read(): Promise<Uint8Array>;
}


