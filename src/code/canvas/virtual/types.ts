import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Id,
    Dot,
    CueDot,
    ICanvas,
    CueThread,
    GridThread,
    StitchThread,
} from "../types.js";

export type DotIndex = { indexX: number, indexY: number };

export interface IVirtualCanvas extends ICanvas {
    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
}

export interface IGridCanvas extends IVirtualCanvas {
    onDrawDots(listener: DrawGridDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawGridThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas {
    onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas {
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

export type DrawStitchDotEvent = { dot: Dot };
export type DrawStitchDotListener = Listener<DrawStitchDotEvent>;

export type DrawStitchThreadsEvent = { threads: Array<StitchThread>, dotRadius: number }; // TODO: dotRadius???
export type DrawStitchThreadsListener = Listener<DrawStitchThreadsEvent>;

export type DrawCueDotEvent = { dot: CueDot, dotRadius: number, dotColor: string };
export type DrawCueDotListener = Listener<DrawCueDotEvent>;

export type DrawCueThreadEvent = { thread: CueThread };
export type DrawCueThreadListener = Listener<DrawCueThreadEvent>;

export type RemoveCueDotEvent = { dotId: Id };
export type RemoveCueDotListener = Listener<RemoveCueDotEvent>;

export type MoveCueThreadEvent = { thread: CueThread };
export type MoveCueThreadListener = Listener<MoveCueThreadEvent>;

export type RemoveCueThreadEvent = { threadId: Id };
export type RemoveCueThreadListener = Listener<RemoveCueThreadEvent>;