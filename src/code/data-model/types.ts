import { CrosslyCanvasPattern } from "../canvas/types.js";
import type {
    ThreadDataModel,
    ThreadPathDataModel,
    CrosslyDataModel,
} from "@textyly/crossly-private-persistence-contracts";

// The pattern data model is shared with crossly.private.persistence.service via its
// published contract. Re-exported here so the rest of the UI keeps importing the
// data-model types from one place, but there is a single source of truth.
export type {
    DotsDataModel,
    FabricThreadsDataModel,
    FabricDataModel,
    ThreadDataModel,
    NeedlePathDataModel,
    ThreadPathDataModel,
    CrosslyDataModel,
} from "@textyly/crossly-private-persistence-contracts";

// UI-local convenience aliases (not part of the wire contract).
export type ThreadsDataModel = Array<ThreadDataModel>;
export type PatternDataModel = Array<ThreadPathDataModel>;
export type ThreadIndexDataModel = number;

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
