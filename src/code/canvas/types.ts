import { Listener, VoidUnsubscribe } from "../types";

export type Bounds = { x: number, y: number, width: number, height: number };
export type Id = number;

export type Dot = { id: Id, x: number, y: number };
export type GridDot = Dot;
export type StitchDot = Dot & { side: CanvasSide };
export type CueDot = Dot;

export type Thread<TDot> = { from: TDot, to: TDot, width: number, color: string };
export type GridThread = Thread<GridDot> & { id: Id, visibility: Visibility };
export type StitchThread = Thread<StitchDot> & { side: CanvasSide };
export type CueThread = Thread<CueDot> & { id: Id };

export type CanvasConfig = {
    dot: DotConfig & { dotMatchDistance: ZoomItemConfig }; //TODO: remove  dotMatchDistance
    thread: ThreadConfig;
    columns: number;
    rows: number;
    spacing: SpacingConfig;
};

export type ZoomItemConfig = { value: number; zoomInStep: number; zoomOutStep: number };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type ThreadConfig = { color: string; width: ZoomItemConfig; };
export type SpacingConfig = ZoomItemConfig;


export type CrosslyCanvasConfig = {
    grid: CanvasConfig,
    stitch: CanvasConfig,
    cue: CanvasConfig
};

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get bounds(): Bounds;
    set bounds(value: Bounds);

    onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
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

export type BoundsChangeEvent = { bounds: Bounds };
export type BoundsChangeListener = Listener<BoundsChangeEvent>;