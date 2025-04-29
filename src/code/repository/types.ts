import { CrosslyCanvasData } from "../canvas/types.js";

export type CrosslyDataModel = {
    name: string;
    fabric: FabricDataModel;
    threads: ThreadsDataModel;
    pattern: PatternDataModel;
};

export type FabricDataModel = {
    name: string;
    columns: number;
    rows: number;
    color: string;
    dots: {
        color: string;
    };
    threads: {
        color: string;
    };
};

export type ThreadsDataModel = Array<ThreadDataModel>;
export type ThreadDataModel = {
    name: string;
    color: string;
    width: number;
};

export type NeedlePathDataModel = {
    indexesX: Array<number>;
    indexesY: Array<number>;
};

export type ThreadIndexDataModel = number;

export type ThreadPathDataModel = {
    threadIndex: ThreadIndexDataModel;
    needlePath: NeedlePathDataModel;
};

export type PatternDataModel = Array<ThreadPathDataModel>;

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


