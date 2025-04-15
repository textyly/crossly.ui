import { DotArray } from "../utilities/arrays/dot/dot.js";
import { FabricThread } from "../utilities/arrays/thread/fabric.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { Id, CueDot, ICanvas, CueSegment, StitchPattern, StitchSegment } from "../types.js";

export interface IVirtualCanvas extends ICanvas {
    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;

    onMoveStart(listener: VoidListener): VoidUnsubscribe;
    onMoveStop(listener: VoidListener): VoidUnsubscribe;

    onThreadColorChange(listener: ColorChangeListener): VoidUnsubscribe;
    onThreadWidthChange(listener: WidthChangeListener): VoidUnsubscribe;
}

export interface IFabricCanvas extends IVirtualCanvas {
    onDrawDots(listener: DrawFabricDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawFabricThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas {
    onDrawSegment(listener: DrawStitchSegmentListener): VoidUnsubscribe;
    onDrawPattern(listener: DrawStitchPatternListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas {
    onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe;

    onDrawSegment(listener: DrawCueSegmentListener): VoidUnsubscribe;
    onDrawDashSegment(listener: DrawCueSegmentListener): VoidUnsubscribe;
    onMoveSegment(listener: MoveCueSegmentListener): VoidUnsubscribe;
    onRemoveSegment(listener: RemoveCueSegmentListener): VoidUnsubscribe;
}

export interface IStitchCanvasFacade extends IStitchCanvas {
    setThread(color: string, width: number): void;
    setThreadColor(color: string): void;
    setThreadWidth(width: number): void;

    cutThread(): void;
}

export interface ICueCanvasFacade extends ICueCanvas {
    setThread(color: string, width: number): void
    setThreadColor(color: string): void;
    setThreadWidth(width: number): void;

    cutThread(): void;
}

export type ColorChangeEvent = { color: string };
export type ColorChangeListener = Listener<ColorChangeEvent>;

export type WidthChangeEvent = { width: number };
export type WidthChangeListener = Listener<WidthChangeEvent>;

export type DrawFabricDotsEvent = { dots: DotArray };
export type DrawFabricDotsListener = Listener<DrawFabricDotsEvent>;

export type DrawFabricThreadsEvent = { threads: FabricThread };
export type DrawFabricThreadsListener = Listener<DrawFabricThreadsEvent>;

export type DrawStitchSegmentEvent = { segment: StitchSegment, density: Density  };
export type DrawStitchSegmentListener = Listener<DrawStitchSegmentEvent>;

export type DrawStitchPatternEvent = { pattern: StitchPattern, density: Density };
export type DrawStitchPatternListener = Listener<DrawStitchPatternEvent>;

export type DrawCueDotEvent = { dot: CueDot, dotRadius: number, dotColor: string };
export type DrawCueDotListener = Listener<DrawCueDotEvent>;

export type DrawCueSegmentEvent = { segment: CueSegment };
export type DrawCueSegmentListener = Listener<DrawCueSegmentEvent>;

export type RemoveCueDotEvent = { dotId: Id };
export type RemoveCueDotListener = Listener<RemoveCueDotEvent>;

export type MoveCueSegmentEvent = { segment: CueSegment };
export type MoveCueSegmentListener = Listener<MoveCueSegmentEvent>;

export type RemoveCueSegmentEvent = { segmentId: Id };
export type RemoveCueSegmentListener = Listener<RemoveCueSegmentEvent>;

export enum Density {
    Low,
    Medium,
    High
}