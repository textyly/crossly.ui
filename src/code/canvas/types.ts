import { Listener, VoidUnsubscribe } from "../types";
import { Position } from "./input/types.js";

export type Bounds = { left: number, top: number, width: number, height: number };
export type BoundsIndexes = { leftTop: DotIndex, rightTop: DotIndex, leftBottom: DotIndex, rightBottom: DotIndex };

export type Id = number;
export type Dot = Position;
export type CueDot = Dot & { id: Id };
export type DotIndex = { dotX: number, dotY: number };

export type CueThread = { id: Id, from: Dot, to: Dot, width: number, color: string };

// StitchTread must not contain inner objects because millions of instances can be stored in the memory
export type StitchTread = {
    visible: boolean;
    fromDotXIdx: number;
    fromDotXPos: number;
    fromDotYIdx: number;
    fromDotYPos: number;
    toDotXIdx: number;
    toDotXPos: number;
    toDotYIdx: number;
    toDotYPos: number;
    width: number;
    zoomedWidth: number;
    color: string;
    side: CanvasSide;
};

export type CanvasConfig = {
    columns: number;
    rows: number;
    dotsSpacing: DotsSpacingConfig;
};

export type InputCanvasConfig = {
    ignoreMoveUntil: number;
    ignoreZoomUntil: number; // only touch zoom related 
};

export type FabricCanvasConfig = CanvasConfig & {
    dot: DotConfig;
    thread: ThreadConfig;
};

export type StitchCanvasConfig = CanvasConfig & {
    thread: ThreadConfig;
};

export type CueCanvasConfig = CanvasConfig & {
    dot: DotConfig;
    thread: ThreadConfig;
};

export type DotConfig = { color: string; radius: number, minRadius: number, radiusZoomStep: number; };
export type ThreadConfig = { color: string; width: number, minWidth: number, widthZoomStep: number; };
export type DotsSpacingConfig = { space: number, minSpace: number, spaceZoomStep: number; };


export type CrosslyCanvasConfig = {
    input: InputCanvasConfig;
    fabric: FabricCanvasConfig,
    stitch: StitchCanvasConfig,
    cue: CueCanvasConfig
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

    setThreadColor(color: string): void;
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