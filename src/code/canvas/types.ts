import { VoidUnsubscribe } from "../types";
import { DotsConfig } from "./virtual/types.js";
import { SizeChangeListener } from "./input/types";

export type Size = { width: number, height: number };

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    draw(dotsConfig: DotsConfig): void;
}