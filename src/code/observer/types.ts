import { StitchPattern } from "../canvas/types.js";
import { Fabric } from "../canvas/virtual/types.js";
import { Listener, VoidUnsubscribe } from "../types.js";

export interface ICrosslyCanvasObserver {
    onChange(listener: ChangeListener): VoidUnsubscribe;
}

export type CrosslyCanvasProject = { name: string, fabric: Fabric; pattern: StitchPattern; };
export type ChangeEvent = { project: CrosslyCanvasProject; }
export type ChangeListener = Listener<ChangeEvent>;