import { VoidUnsubscribe } from "../types";
import { SizeChangeListener } from "./input/types";

export type Size = { width: number, height: number };

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface IDisposable {
    dispose(): void;
}