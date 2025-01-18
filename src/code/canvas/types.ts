import { VoidUnsubscribe } from "../types";
import { SizeChangeListener } from "./input/types";
import { DotsConfig } from "./virtual/types.js";

export type Size = { width: number, height: number };

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface IDisposable {
    dispose(): void;
}

export interface ICrosslyCanvas extends ICanvas {
    draw(dotsConfig: DotsConfig): void;
}