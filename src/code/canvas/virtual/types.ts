import { Position } from "../input/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    StitchDot,
    StitchThread,
    CueThread,
    ICanvas,
    GridDot,
    GridThread,
    CueDot,
    GridCanvasConfig,
    StitchCanvasConfig,
    CueCanvasConfig
} from "../types.js";

export interface IVirtualCanvas<TConfig> extends ICanvas {
    get config(): TConfig;

    get dotColor(): string;
    set dotColor(value: string);

    get dotRadius(): number;
    set dotRadius(value: number);

    get threadColor(): string;
    set threadColor(value: string);

    get threadWidth(): number;
    set threadWidth(value: number);

    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
}


export interface IGridCanvas extends IVirtualCanvas<GridCanvasConfig> {
    get rows(): number;
    set rows(value: number);

    get columns(): number;
    set columns(value: number);

    get spacing(): number;

    getDotById(id: string): GridDot | undefined;
    getDotByPosition(position: Position): GridDot | undefined;

    onDrawVisibleDots(listener: DrawGridDotsListener): VoidUnsubscribe;
    onDrawInvisibleDots(listener: DrawGridDotsListener): VoidUnsubscribe;

    onDrawVisibleThreads(listener: DrawGridThreadsListener): VoidUnsubscribe;
    onDrawInvisibleThreads(listener: DrawGridThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas<StitchCanvasConfig> {
    onDrawFrontThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe;
    onDrawBackThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas<CueCanvasConfig> {
    onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe;

    onDrawThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onDrawDashThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onMoveThread(listener: MoveCueThreadListener): VoidUnsubscribe;
    onRemoveThread(listener: RemoveCueThreadListener): VoidUnsubscribe;
}

export interface IDotMatcher {
    match(dot: GridDot, position: Position, dotMatchDistance: number): boolean;
}

export type DrawGridDotsEvent = { dots: Array<GridDot> };
export type DrawGridDotsListener = Listener<DrawGridDotsEvent>;

export type DrawGridThreadsEvent = { threads: Array<GridThread> };
export type DrawGridThreadsListener = Listener<DrawGridThreadsEvent>;

export type DrawStitchDotEvent = { dot: StitchDot };
export type DrawStitchDotListener = Listener<DrawStitchDotEvent>;

export type DrawStitchThreadsEvent = { threads: Array<StitchThread> };
export type DrawStitchThreadsListener = Listener<DrawStitchThreadsEvent>;

export type DrawCueDotEvent = { dot: CueDot };
export type DrawCueDotListener = Listener<DrawCueDotEvent>;

export type DrawCueThreadEvent = { thread: CueThread };
export type DrawCueThreadListener = Listener<DrawCueThreadEvent>;

export type RemoveCueDotEvent = { dot: CueDot };
export type RemoveCueDotListener = Listener<RemoveCueDotEvent>;

export type MoveCueThreadEvent = { thread: CueThread };
export type MoveCueThreadListener = Listener<MoveCueThreadEvent>;

export type RemoveCueThreadEvent = { thread: CueThread };
export type RemoveCueThreadListener = Listener<MoveCueThreadEvent>;