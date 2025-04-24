import { CrosslyCanvasData, Dot } from "../../canvas/types.js";

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
        radius: number;
        space: number;
        hidden: {
            enabled: boolean;
        }
    },
    threads: {
        color: string;
        width: number;
    }
};

export type ThreadsDataModel = Array<ThreadDataModel>;
export type ThreadDataModel = {
    name: string;
    color: string;
    width: number;
};

export type HoleDataModel = Dot;
export type NeedlePathDataModel = Array<HoleDataModel>;
export type ThreadIndexDataModel = number;

export type ThreadPathDataModel = {
    threadIndex: ThreadIndexDataModel;
    needlePath: NeedlePathDataModel;
}

export type PatternDataModel = Array<ThreadPathDataModel>;

export interface ICrosslySerializer {
    serialize(canvasData: CrosslyCanvasData): CrosslyDataModel;
    deserialize(dataModel: CrosslyDataModel): CrosslyCanvasData;
}


