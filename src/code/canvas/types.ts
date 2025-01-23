import { Listener, VoidUnsubscribe } from "../types";

export type Id = string;
export type Dot = { id: Id, x: number, y: number, radius: number };
export type StitchDot = Dot & { side: CanvasSide };
export type GridDot = Dot & { visibility: Visibility };

export type Line<TDot> = { from: TDot, to: TDot, width: number };
export type StitchLine = Line<StitchDot> & { side: CanvasSide };
export type GridLine = Line<GridDot> & { visibility: Visibility };
export type Link = { id: Id } & StitchLine;

export type Size = { width: number, height: number };
export type RadiusConfig = { value: number, step: number };
export type SpacingConfig = { value: number, step: number };

export type CanvasConfig = {
    columns: number,
    rows: number,
    // grid (radius + spacing) 
    radius: RadiusConfig,
    spacing: SpacingConfig,
    // cue (dot and link)
    // stitch (width, ...)
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