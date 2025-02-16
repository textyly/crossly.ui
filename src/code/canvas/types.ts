import { Listener, VoidUnsubscribe } from "../types";
import { Position } from "./input/types.js";

export type Bounds = { left: number, top: number, width: number, height: number };
export type Id = number;

export type Dot = Position;
export type CueDot = Dot & { id: Id };

export type Thread<TDot extends Dot> = { from: TDot, to: TDot, width: number, color: string };
export type FabricThread = Thread<Dot>;
export type StitchThread = Thread<Dot> & { side: CanvasSide };
export type CueThread = Thread<Dot> & { id: Id };

export type CanvasConfig = {
    columns: number;
    rows: number;
    dot: DotConfig;
    dotSpacing: SpacingConfig;
    thread: ThreadConfig;
};

export type ZoomItemConfig = { value: number; zoomInStep: number; zoomOutStep: number };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type ThreadConfig = { color: string; width: ZoomItemConfig; };
export type SpacingConfig = ZoomItemConfig;


export type CrosslyCanvasConfig = {
    fabric: CanvasConfig,
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