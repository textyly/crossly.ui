import { DotArray } from "../utilities/arrays/dot/dot.js";
import { Id, CueDot, ICanvas, CueThread } from "../types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { ThreadArray } from "../utilities/arrays/thread/array.js";
import { StitchThreadArray } from "../utilities/arrays/thread/stitch.js";

export interface IVirtualCanvas extends ICanvas {
    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
    onMoveStart(listener: VoidListener): VoidUnsubscribe;
    onMoveStop(listener: VoidListener): VoidUnsubscribe;
}

export interface IFabricCanvas extends IVirtualCanvas {
    onDrawDots(listener: DrawFabricDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawFabricThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas {
    onDrawDots(listener: DrawStitchDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas {
    onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe;
    // TODO:  onMoveDot(listener: MoveCueDotListener): VoidUnsubscribe;
    onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe;

    onDrawThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onDrawDashThread(listener: DrawCueThreadListener): VoidUnsubscribe;
    onMoveThread(listener: MoveCueThreadListener): VoidUnsubscribe;
    onRemoveThread(listener: RemoveCueThreadListener): VoidUnsubscribe;
}

export type DrawFabricDotsEvent = { dots: DotArray };
export type DrawFabricDotsListener = Listener<DrawFabricDotsEvent>;

export type DrawFabricThreadsEvent = { threads: ThreadArray };
export type DrawFabricThreadsListener = Listener<DrawFabricThreadsEvent>;

export type DrawStitchDotsEvent = { dots: DotArray };
export type DrawStitchDotsListener = Listener<DrawStitchDotsEvent>;

export type DrawStitchThreadsEvent = { threads: StitchThreadArray };
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