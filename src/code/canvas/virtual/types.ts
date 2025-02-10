import { Position } from "../input/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Bounds,
    CueDot,
    ICanvas,
    GridDot,
    StitchDot,
    CueThread,
    GridThread,
    StitchThread,
    CanvasConfig,
    BoundsChangeListener,
} from "../types.js";

export interface IVirtualCanvas<TConfig> extends ICanvas {
    get config(): TConfig;
    get virtualBounds(): Bounds;

    draw(): void;

    onVirtualBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
}


export interface IGridCanvas extends IVirtualCanvas<CanvasConfig> {
    getDotById(id: number): GridDot | undefined;
    getDotByPosition(position: Position): GridDot | undefined;

    onDrawDots(listener: DrawGridDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawGridThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas<CanvasConfig> {
    onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas<CanvasConfig> {
    onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe;

    onDrawThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onDrawDashThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onMoveThread(listener: MoveCueThreadListener): VoidUnsubscribe;
    onRemoveThread(listener: RemoveCueThreadListener): VoidUnsubscribe;
}

export type DrawGridDotsEvent = { dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string };
export type DrawGridDotsListener = Listener<DrawGridDotsEvent>;

export type DrawGridThreadsEvent = { threads: Array<GridThread> };
export type DrawGridThreadsListener = Listener<DrawGridThreadsEvent>;

export type DrawStitchDotEvent = { dot: StitchDot };
export type DrawStitchDotListener = Listener<DrawStitchDotEvent>;

export type DrawStitchThreadsEvent = { threads: Array<StitchThread>, dotRadius: number }; // TODO: dotRadius???
export type DrawStitchThreadsListener = Listener<DrawStitchThreadsEvent>;

export type DrawCueDotEvent = { dot: CueDot, dotRadius: number, dotColor: string };
export type DrawCueDotListener = Listener<DrawCueDotEvent>;

export type DrawCueThreadEvent = { thread: CueThread };
export type DrawCueThreadListener = Listener<DrawCueThreadEvent>;

export type RemoveCueDotEvent = { dot: CueDot };
export type RemoveCueDotListener = Listener<RemoveCueDotEvent>;

export type MoveCueThreadEvent = { thread: CueThread };
export type MoveCueThreadListener = Listener<MoveCueThreadEvent>;

export type RemoveCueThreadEvent = { thread: CueThread };
export type RemoveCueThreadListener = Listener<MoveCueThreadEvent>;