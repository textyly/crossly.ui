import { Listener, VoidUnsubscribe } from "../types";

export type Size = { width: number, height: number };
export type Id = string;

export type Dot = { id: Id, x: number, y: number, radius: number, color: string };
export type GridDot = Dot & { visibility: Visibility };
export type StitchDot = Dot & { side: CanvasSide };
export type CueDot = Dot;

export type Thread<TDot> = { from: TDot, to: TDot, width: number, color: string };
export type GridThread = Thread<GridDot> & { id: Id, visibility: Visibility };
export type StitchThread = Thread<StitchDot> & { side: CanvasSide };
export type CueThread = Thread<CueDot> & { id: Id };

export type CanvasConfig = {
    dot: DotConfig,
    thread: ThreadConfig
};

export type ZoomItemConfig = { value: number; zoomStep: number; };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type ThreadConfig = { color: string; width: ZoomItemConfig; };
export type SpacingConfig = ZoomItemConfig;

export type GridCanvasConfig = CanvasConfig & {
    columns: number;
    rows: number;
    spacing: SpacingConfig;
}

export type CrosslyCanvasConfig = {
    grid: GridCanvasConfig,
    stitch: StitchCanvasConfig,
    cue: CueCanvasConfig
};

export type StitchCanvasConfig = CanvasConfig;
export type CueCanvasConfig = CanvasConfig;

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    get configuration(): CrosslyCanvasConfig;

    draw(): void;
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