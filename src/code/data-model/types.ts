import { CrosslyCanvasPattern } from "../canvas/types.js";

export type CrosslyDataModel = {
    version: string;
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

export interface IValidator {
    get version(): string;

    validateDataModel(dataModel: CrosslyDataModel): void;
    validateCrosslyPattern(pattern: CrosslyCanvasPattern): void;
};

export interface IConverter {
    get version(): string;

    convertToDataModel(name: string, pattern: CrosslyCanvasPattern): CrosslyDataModel;
    convertToCrosslyPattern(dataModel: CrosslyDataModel): CrosslyCanvasPattern;
};
