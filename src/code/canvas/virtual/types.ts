import { Id, CueDot, ICanvas, CueThread } from "../types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";

export type DotIndex = { dotX: number, dotY: number };

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

export type DrawFabricDotsEvent = { dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string };
export type DrawFabricDotsListener = Listener<DrawFabricDotsEvent>;

export type DrawFabricThreadsEvent = { visible: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, widths: Array<number>, colors: Array<string> };
export type DrawFabricThreadsListener = Listener<DrawFabricThreadsEvent>;

export type DrawStitchDotsEvent = { dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string };
export type DrawStitchDotsListener = Listener<DrawStitchDotsEvent>;

export type DrawStitchThreadsEvent = { visible: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, widths: Array<number>, colors: Array<string> };
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