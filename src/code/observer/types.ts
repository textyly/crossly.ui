import { Fabric } from "../canvas/virtual/types.js";
import { Pattern } from "../serialization/types.js";
import { Listener, VoidUnsubscribe } from "../types.js";

export interface ICrosslyCanvasObserver {
    onChange(listener: ChangeListener): VoidUnsubscribe;
}

export type CrosslyCanvas = { fabric: Fabric; pattern: Pattern; };
export type ChangeEvent = { event: CrosslyCanvas; }
export type ChangeListener = Listener<ChangeEvent>;