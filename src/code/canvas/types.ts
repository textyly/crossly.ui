import { VoidUnsubscribe } from "../types";
import { SizeChangeListener } from "./input/types";

export type Size = { width: number, height: number };

export interface ICanvas {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}