import { Listener, VoidUnsubscribe } from "../types";
import { CueCanvasConfig, GridCanvasConfig, StitchCanvasConfig } from "./virtual/types.js";

export type Size = { width: number, height: number };
export type Id = string;

export type Dot = { id: Id, x: number, y: number, radius: number, color: string };
export type GridDot = Dot & { visibility: Visibility };
export type StitchDot = Dot & { side: CanvasSide };
export type CueDot = GridDot;

export type Line<TDot> = { from: TDot, to: TDot, width: number, color: string };
export type GridLine = Line<GridDot> & { visibility: Visibility };
export type StitchLine = Line<StitchDot> & { side: CanvasSide };
export type CueLine = { id: Id } & StitchLine;

export type RadiusConfig = { value: number, step: number };
export type SpacingConfig = { value: number, step: number };

export type CanvasConfig = {
    grid: GridCanvasConfig,
    stitch: StitchCanvasConfig,
    cue: CueCanvasConfig
};

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    draw(config: CanvasConfig): void;
}

export enum CanvasSide {
    Front,
    Back,
}

export enum Visibility {
    Visible,
    Invisible,
}

export type SizeChangeEvent = { size: Size };
export type SizeChangeListener = Listener<SizeChangeEvent>;